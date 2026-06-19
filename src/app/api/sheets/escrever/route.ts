import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { encontrarPorNomeDisplay } from '@/config/colaboradores'
import { MESES_COLUNAS } from '@/config/meses-colunas'
import { MAPEAMENTO_METRICAS, normalizarLabel } from '@/agents/sheets-mapeamento'
import { ROTULOS_SEMANAL } from '@/agents/dicionario-tarefas'
import type { LinhaDashboard } from '@/agents/relatorio'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!

function getAuth() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON não configurado')
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(credJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function POST(request: Request) {
  try {
    const { nomeDisplay, senha, mes, linhasDashboard } = (await request.json()) as {
      nomeDisplay: string
      senha: string
      mes: number
      linhasDashboard: LinhaDashboard[]
    }

    // ── 1. Validar credenciais ───────────────────────────────────────────────
    const colaborador = encontrarPorNomeDisplay(nomeDisplay)
    if (!colaborador || colaborador.senha !== senha) {
      return NextResponse.json({ erro: 'Nome ou senha incorretos.' }, { status: 401 })
    }

    // ── 2. Resolver coluna do mês ────────────────────────────────────────────
    const coluna = MESES_COLUNAS[mes]
    if (!coluna) {
      return NextResponse.json({ erro: `Mês inválido: ${mes}` }, { status: 400 })
    }

    const aba = colaborador.abaSheet

    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })

    // ── 3. Ler coluna A (labels) ─────────────────────────────────────────────
    const resLabels = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${aba}'!A:A`,
      valueRenderOption: 'FORMATTED_VALUE',
    })
    const colunaA: string[] = (resLabels.data.values ?? []).map((r) => String(r[0] ?? ''))

    // ── 4. Ler coluna do mês com FORMULA (detectar fórmulas) ─────────────────
    const resFormulas = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${aba}'!${coluna}:${coluna}`,
      valueRenderOption: 'FORMULA',
    })
    const celulasFormula: string[] = (resFormulas.data.values ?? []).map((r) => String(r[0] ?? ''))

    // ── 5. Ler coluna do mês com valores numéricos (para somar) ─────────────
    const resValores = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${aba}'!${coluna}:${coluna}`,
      valueRenderOption: 'UNFORMATTED_VALUE',
    })
    const valoresAtuais: (number | null)[] = (resValores.data.values ?? []).map((r) => {
      const n = parseFloat(String(r[0] ?? ''))
      return isNaN(n) ? null : n
    })

    // ── 6. Índice por label normalizado ──────────────────────────────────────
    const labelParaLinha = new Map<string, number>()
    colunaA.forEach((label, i) => {
      if (label) labelParaLinha.set(normalizarLabel(label), i)
    })

    // ── 7. Calcular updates com lógica SEMANAL / MENSAL ─────────────────────
    // Semanal  → SOMA ao valor existente
    // Mensal   → INSERE (sobrescreve valor não-fórmula)
    const updates: Array<{ range: string; values: [[number]] }> = []
    const celulasUsadas = new Set<string>()

    for (const linha of linhasDashboard) {
      for (const metrica of linha.metricas) {
        const labelSheet = MAPEAMENTO_METRICAS[metrica.rotulo]
        if (!labelSheet) continue

        const linhaIdx = labelParaLinha.get(normalizarLabel(labelSheet))
        if (linhaIdx === undefined) continue

        // Pula células com fórmula
        if (celulasFormula[linhaIdx]?.startsWith('=')) continue

        const cellRange = `'${aba}'!${coluna}${linhaIdx + 1}`
        if (celulasUsadas.has(cellRange)) continue
        celulasUsadas.add(cellRange)

        const ehSemanal = ROTULOS_SEMANAL.has(metrica.rotulo)
        const valorAtual = valoresAtuais[linhaIdx] ?? 0

        // Semanal: soma | Mensal: insere direto
        const novoValor = ehSemanal ? valorAtual + metrica.valor : metrica.valor

        updates.push({ range: cellRange, values: [[novoValor]] })
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, atualizadas: 0, aba })
    }

    // ── 8. Escrever em batch ──────────────────────────────────────────────────
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates },
    })

    return NextResponse.json({ ok: true, atualizadas: updates.length, aba })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[sheets/escrever]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

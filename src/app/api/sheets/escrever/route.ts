import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { MAPEAMENTO_METRICAS, normalizarLabel } from '@/agents/sheets-mapeamento'
import type { LinhaDashboard } from '@/agents/relatorio'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!
const COLUNA_ENTRADA = process.env.COLUNA_ENTRADA ?? 'F'

function getAuth() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON não configurado')
  const credentials = JSON.parse(credJson)
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function POST(request: Request) {
  try {
    const { aba, linhasDashboard } = (await request.json()) as {
      aba: string
      linhasDashboard: LinhaDashboard[]
    }

    if (!aba || !linhasDashboard?.length) {
      return NextResponse.json({ erro: 'Dados inválidos' }, { status: 400 })
    }

    const auth = getAuth()
    const sheets = google.sheets({ version: 'v4', auth })

    // ── 1. Ler coluna A inteira (labels) com valores reais ──────────────────
    const rangeLabels = `'${aba}'!A:A`
    const resLabels = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeLabels,
      valueRenderOption: 'FORMATTED_VALUE',
    })
    const colunaA: string[] = (resLabels.data.values ?? []).map((r) => String(r[0] ?? ''))

    // ── 2. Ler coluna alvo com FORMULA para detectar fórmulas ───────────────
    const rangeEntrada = `'${aba}'!${COLUNA_ENTRADA}:${COLUNA_ENTRADA}`
    const resEntrada = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeEntrada,
      valueRenderOption: 'FORMULA',
    })
    const colunaEntrada: string[] = (resEntrada.data.values ?? []).map((r) => String(r[0] ?? ''))

    // ── 3. Ler coluna alvo com valores formatados para somar ─────────────────
    const resValores = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeEntrada,
      valueRenderOption: 'UNFORMATTED_VALUE',
    })
    const valoresAtuais: (number | null)[] = (resValores.data.values ?? []).map((r) => {
      const v = r[0]
      const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
      return isNaN(n) ? null : n
    })

    // ── 4. Construir mapa label_normalizado → índice de linha (0-based) ──────
    const labelParaLinha = new Map<string, number>()
    colunaA.forEach((label, i) => {
      if (label) labelParaLinha.set(normalizarLabel(label), i)
    })

    // ── 5. Calcular atualizações (apenas células numéricas, sem fórmulas) ────
    const updates: Array<{ range: string; values: [[number]] }> = []

    const labelsAlvo = new Map<string, number>()
    for (const linha of linhasDashboard) {
      for (const metrica of linha.metricas) {
        const labelSheet = MAPEAMENTO_METRICAS[metrica.rotulo]
        if (!labelSheet) continue

        const labelNorm = normalizarLabel(labelSheet)
        const linhaIdx = labelParaLinha.get(labelNorm)
        if (linhaIdx === undefined) continue

        const formula = colunaEntrada[linhaIdx] ?? ''
        if (formula.startsWith('=')) continue // pula fórmulas

        const valorAtual = valoresAtuais[linhaIdx] ?? 0
        const novoValor = valorAtual + metrica.valor

        const rowNum = linhaIdx + 1
        const cellRange = `'${aba}'!${COLUNA_ENTRADA}${rowNum}`

        // Evita duplicar se a mesma célula aparecer em múltiplas linhas do dashboard
        if (!labelsAlvo.has(cellRange)) {
          labelsAlvo.set(cellRange, novoValor)
          updates.push({ range: cellRange, values: [[novoValor]] })
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ ok: true, atualizadas: 0 })
    }

    // ── 6. Escrever em batch ──────────────────────────────────────────────────
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates,
      },
    })

    return NextResponse.json({ ok: true, atualizadas: updates.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[sheets/escrever]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

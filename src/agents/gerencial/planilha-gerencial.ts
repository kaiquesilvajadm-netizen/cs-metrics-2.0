import 'server-only'
import { google } from 'googleapis'
import { MESES_COLUNAS } from '@/config/meses-colunas'
import { normalizarLabel } from '@/agents/sheets-mapeamento'
import { ABA_METAS, ABA_FECHAMENTOS, METAS_CONFIG, COLUNAS_TRIMESTRE, COLUNA_ANO } from '@/config/metas-gerencial'
import { abasUnicas } from '@/agents/gerencial/leitura-abas'
import type { MetricasColaboradorMes, NivelMeta } from '@/types/gerencial'

export type Trimestre = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type IdentificadorNivel = number | Trimestre | 'ano'

export function trimestreDoMes(mes: number): Trimestre {
  if (mes <= 3) return 'Q1'
  if (mes <= 6) return 'Q2'
  if (mes <= 9) return 'Q3'
  return 'Q4'
}

const SPREADSHEET_ID = process.env.GOOGLE_GERENCIAL_SPREADSHEET_ID!

function getAuthGerencial() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON não configurado')
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(credJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuthGerencial() })
}

function indiceDaColuna(letra: string): number {
  return letra.charCodeAt(0) - 'A'.charCodeAt(0)
}

// ── Metas do Time ────────────────────────────────────────────────────────────
// Cada meta pode ser configurada em 3 níveis (colunas diferentes na mesma
// linha): Mês (C-N), Trimestre (O-R) ou Ano (S) — o líder escolhe o nível
// ao preencher Métricas Esperadas. A leitura para exibição resolve em
// cascata: valor do mês > valor do trimestre > valor do ano.

function colunaDoNivel(nivel: NivelMeta, identificador: IdentificadorNivel): string {
  if (nivel === 'mes') return MESES_COLUNAS[identificador as number]
  if (nivel === 'trimestre') return COLUNAS_TRIMESTRE[identificador as Trimestre]
  return COLUNA_ANO
}

async function lerColunaA(sheets: ReturnType<typeof getSheets>) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${ABA_METAS}'!A:A`,
    valueRenderOption: 'FORMATTED_VALUE',
  })
  const colunaA: string[] = (res.data.values ?? []).map((r) => String(r[0] ?? ''))
  const indiceLabel = new Map<string, number>()
  colunaA.forEach((label, i) => {
    if (label) indiceLabel.set(normalizarLabel(label), i)
  })
  return indiceLabel
}

export async function lerMetasNivel(nivel: NivelMeta, identificador: IdentificadorNivel): Promise<Record<string, number | null>> {
  const coluna = colunaDoNivel(nivel, identificador)
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${ABA_METAS}'!A:${coluna}`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  const rows = (res.data.values ?? []) as unknown[][]

  const indiceLabel = new Map<string, number>()
  rows.forEach((linha, i) => {
    const label = String(linha[0] ?? '').trim()
    if (label) indiceLabel.set(normalizarLabel(label), i)
  })

  const idxCol = indiceDaColuna(coluna)
  const metas: Record<string, number | null> = {}

  for (const def of METAS_CONFIG) {
    const idxLinha = indiceLabel.get(normalizarLabel(def.rotulo))
    if (idxLinha === undefined) {
      metas[def.chave] = null
      continue
    }
    const valor = rows[idxLinha]?.[idxCol]
    const numero = typeof valor === 'number' ? valor : Number(valor)
    metas[def.chave] = valor === undefined || valor === null || valor === '' || Number.isNaN(numero) ? null : numero
  }

  return metas
}

export async function salvarMetasNivel(nivel: NivelMeta, identificador: IdentificadorNivel, metas: Record<string, number>): Promise<void> {
  const sheets = getSheets()
  const indiceLabel = await lerColunaA(sheets)
  const coluna = colunaDoNivel(nivel, identificador)
  const updates: Array<{ range: string; values: [[number]] }> = []

  for (const def of METAS_CONFIG) {
    const valor = metas[def.chave]
    if (valor === undefined || valor === null || Number.isNaN(valor)) continue

    const idxLinha = indiceLabel.get(normalizarLabel(def.rotulo))
    if (idxLinha === undefined) continue // linha não existe na planilha — não inventa linha nova aqui

    updates.push({ range: `'${ABA_METAS}'!${coluna}${idxLinha + 1}`, values: [[valor]] })
  }

  if (updates.length === 0) return

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data: updates },
  })
}

// Resolve a meta de UM mês em cascata: valor configurado pro mês > valor do
// trimestre que contém esse mês > valor anual. Usado pelo Menu 1/3.
export async function resolverMetasDoMes(mes: number): Promise<Record<string, number | null>> {
  const [porMes, porTrimestre, porAno] = await Promise.all([
    lerMetasNivel('mes', mes),
    lerMetasNivel('trimestre', trimestreDoMes(mes)),
    lerMetasNivel('ano', 'ano'),
  ])
  const resultado: Record<string, number | null> = {}
  for (const def of METAS_CONFIG) {
    resultado[def.chave] = porMes[def.chave] ?? porTrimestre[def.chave] ?? porAno[def.chave] ?? null
  }
  return resultado
}

// Resolve a meta de um PERÍODO (Q1..Q4 ou "ano") em cascata: valor
// configurado direto pro período > agregação dos meses fechados (soma /
// média / último valor, conforme cada métrica) > valor anual. Usado pelo
// Menu 4.
export async function resolverMetasDoPeriodo(
  periodo: Trimestre | 'ano',
  mesesFechados: number[]
): Promise<Record<string, number | null>> {
  const [porPeriodo, porAno, agregadoMeses] = await Promise.all([
    periodo === 'ano' ? lerMetasNivel('ano', 'ano') : lerMetasNivel('trimestre', periodo),
    lerMetasNivel('ano', 'ano'),
    lerMetasPeriodo(mesesFechados),
  ])
  const resultado: Record<string, number | null> = {}
  for (const def of METAS_CONFIG) {
    resultado[def.chave] = porPeriodo[def.chave] ?? agregadoMeses[def.chave] ?? porAno[def.chave] ?? null
  }
  return resultado
}

// Consolida as metas ao longo de vários meses, respeitando a agregação
// própria de cada meta (soma para fluxos, média para taxas, último valor
// para fotos/estoques — ver METAS_CONFIG). Usada como um dos níveis do
// fallback em resolverMetasDoPeriodo.
export async function lerMetasPeriodo(meses: number[]): Promise<Record<string, number | null>> {
  const metasPorMes = await Promise.all(meses.map((mes) => lerMetasNivel('mes', mes)))
  const resultado: Record<string, number | null> = {}

  for (const def of METAS_CONFIG) {
    const valores = metasPorMes.map((m) => m[def.chave]).filter((v): v is number => v !== null && v !== undefined)

    if (valores.length === 0) {
      resultado[def.chave] = null
      continue
    }

    if (def.agregacaoPeriodo === 'ultimo_valor') {
      resultado[def.chave] = metasPorMes[metasPorMes.length - 1]?.[def.chave] ?? null
      continue
    }

    const soma = valores.reduce((s, v) => s + v, 0)
    resultado[def.chave] = def.agregacaoPeriodo === 'media' ? soma / valores.length : soma
  }

  return resultado
}

// ── Fechamentos Mensais ───────────────────────────────────────────────────────

const COLUNAS_FECHAMENTO = [
  'ano',
  'mes',
  'abaSheet',
  'churnsRegistrados',
  'inadimplentesResgatados',
  'reunioesCultivacaoRealizadas',
  'reuniaoPipeDeRisco',
  'reuniaoIAeAutomacoes',
  'reunioesRemarcadasCanceladas',
  'coberturaBaseTotal',
  'coberturaBasePercentual',
  'oportunidadesTotaisGeradas',
  'totalContasCarteira',
  'contasExcellent',
  'contasGood',
  'contasPoor',
  'contasBad',
  'churnPercentual', // adicionado depois, no fim da lista de propósito — não mexe na posição das colunas já existentes em fechamentos antigos
  'fechadoEm',
] as const

const ULTIMA_COLUNA_FECHAMENTO = String.fromCharCode('A'.charCodeAt(0) + COLUNAS_FECHAMENTO.length - 1) // 'R'

function linhaParaMetrica(linha: unknown[]): { ano: number; mes: number; metricas: MetricasColaboradorMes } | null {
  const obj: Record<string, unknown> = {}
  COLUNAS_FECHAMENTO.forEach((chave, i) => (obj[chave] = linha[i]))

  const ano = Number(obj.ano)
  const mes = Number(obj.mes)
  // NÃO faz trim aqui: algumas abas têm espaço à direita de propósito
  // ("Tércio ", "Pedro ") e isso precisa bater exatamente com abaSheet em
  // COLABORADORES, senão a busca por chave no Map falha silenciosamente.
  const abaSheet = String(obj.abaSheet ?? '')
  if (!abaSheet.trim() || Number.isNaN(ano) || Number.isNaN(mes)) return null

  const numeroOuNulo = (v: unknown): number | null => {
    if (v === undefined || v === null || v === '') return null
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isNaN(n) ? null : n
  }

  return {
    ano,
    mes,
    metricas: {
      abaSheet,
      mes,
      ano,
      churnsRegistrados: numeroOuNulo(obj.churnsRegistrados),
      churnPercentual: numeroOuNulo(obj.churnPercentual),
      inadimplentesResgatados: numeroOuNulo(obj.inadimplentesResgatados),
      reunioesCultivacaoRealizadas: numeroOuNulo(obj.reunioesCultivacaoRealizadas),
      reuniaoPipeDeRisco: numeroOuNulo(obj.reuniaoPipeDeRisco),
      reuniaoIAeAutomacoes: numeroOuNulo(obj.reuniaoIAeAutomacoes),
      reunioesRemarcadasCanceladas: numeroOuNulo(obj.reunioesRemarcadasCanceladas),
      coberturaBaseTotal: numeroOuNulo(obj.coberturaBaseTotal),
      coberturaBasePercentual: numeroOuNulo(obj.coberturaBasePercentual),
      oportunidadesTotaisGeradas: numeroOuNulo(obj.oportunidadesTotaisGeradas),
      totalContasCarteira: numeroOuNulo(obj.totalContasCarteira),
      contasExcellent: numeroOuNulo(obj.contasExcellent),
      contasGood: numeroOuNulo(obj.contasGood),
      contasPoor: numeroOuNulo(obj.contasPoor),
      contasBad: numeroOuNulo(obj.contasBad),
    },
  }
}

function metricaParaLinha(m: MetricasColaboradorMes, fechadoEm: string): unknown[] {
  return [
    m.ano,
    m.mes,
    m.abaSheet,
    m.churnsRegistrados ?? '',
    m.inadimplentesResgatados ?? '',
    m.reunioesCultivacaoRealizadas ?? '',
    m.reuniaoPipeDeRisco ?? '',
    m.reuniaoIAeAutomacoes ?? '',
    m.reunioesRemarcadasCanceladas ?? '',
    m.coberturaBaseTotal ?? '',
    m.coberturaBasePercentual ?? '',
    m.oportunidadesTotaisGeradas ?? '',
    m.totalContasCarteira ?? '',
    m.contasExcellent ?? '',
    m.contasGood ?? '',
    m.contasPoor ?? '',
    m.contasBad ?? '',
    m.churnPercentual ?? '',
    fechadoEm,
  ]
}

async function lerTodasAsLinhasFechamento(): Promise<unknown[][]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${ABA_FECHAMENTOS}'!A2:${ULTIMA_COLUNA_FECHAMENTO}`,
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  return (res.data.values ?? []) as unknown[][]
}

// Fechado = existe registro para TODAS as 15 abas únicas naquele (ano, mês).
// Um fechamento parcial (ex: só 10 de 15 abas) não conta como fechado —
// evita mostrar dado incompleto como se fosse o resultado oficial do mês.
export async function mesEstaFechado(mes: number, ano: number): Promise<boolean> {
  const linhas = await lerTodasAsLinhasFechamento()
  const abasFechadas = new Set(
    linhas
      .map(linhaParaMetrica)
      .filter((r): r is NonNullable<typeof r> => r !== null && r.ano === ano && r.mes === mes)
      .map((r) => r.metricas.abaSheet)
  )
  return abasFechadas.size >= abasUnicas().length
}

export async function lerMesesFechados(
  meses: number[],
  ano: number
): Promise<Map<string, Map<number, MetricasColaboradorMes>>> {
  const linhas = await lerTodasAsLinhasFechamento()
  const mesesSet = new Set(meses)
  const resultado = new Map<string, Map<number, MetricasColaboradorMes>>()

  for (const linha of linhas) {
    const r = linhaParaMetrica(linha)
    if (!r || r.ano !== ano || !mesesSet.has(r.mes)) continue

    const porMes = resultado.get(r.metricas.abaSheet) ?? new Map<number, MetricasColaboradorMes>()
    porMes.set(r.mes, r.metricas)
    resultado.set(r.metricas.abaSheet, porMes)
  }

  return resultado
}

// Fecha o mês: sobrescreve (por aba) as linhas existentes daquele (ano,mês)
// e faz append das que ainda não existem. Fechar de novo um mês já fechado
// simplesmente substitui os valores — mesma filosofia de "última ação vale"
// do resto do app.
export async function fecharMes(mes: number, ano: number, dados: Map<string, MetricasColaboradorMes>): Promise<void> {
  const sheets = getSheets()
  const linhasAtuais = await lerTodasAsLinhasFechamento()

  const indicePorChave = new Map<string, number>() // `${ano}-${mes}-${aba}` -> linha da planilha (1-based, já contando o header)
  linhasAtuais.forEach((linha, i) => {
    const r = linhaParaMetrica(linha)
    if (!r) return
    indicePorChave.set(`${r.ano}-${r.mes}-${r.metricas.abaSheet}`, i + 2) // +2: header é linha 1, dados começam na 2
  })

  const fechadoEm = new Date().toISOString()
  const updates: Array<{ range: string; values: unknown[][] }> = []
  const novasLinhas: unknown[][] = []

  for (const [abaSheet, metricas] of dados) {
    const chave = `${ano}-${mes}-${abaSheet}`
    const linhaValores = metricaParaLinha(metricas, fechadoEm)
    const numeroLinha = indicePorChave.get(chave)

    if (numeroLinha !== undefined) {
      updates.push({ range: `'${ABA_FECHAMENTOS}'!A${numeroLinha}:${ULTIMA_COLUNA_FECHAMENTO}${numeroLinha}`, values: [linhaValores] })
    } else {
      novasLinhas.push(linhaValores)
    }
  }

  if (updates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { valueInputOption: 'RAW', data: updates },
    })
  }

  if (novasLinhas.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${ABA_FECHAMENTOS}'!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: novasLinhas },
    })
  }
}

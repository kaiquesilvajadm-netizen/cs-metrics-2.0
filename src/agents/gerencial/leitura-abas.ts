import 'server-only'
import { google } from 'googleapis'
import { COLABORADORES } from '@/config/colaboradores'
import { MESES_COLUNAS } from '@/config/meses-colunas'
import { MAPEAMENTO_METRICAS, normalizarLabel } from '@/agents/sheets-mapeamento'
import {
  METRICAS_REUNIAO,
  METRICA_OUTRAS_REUNIOES_CULTIVACAO,
  METRICAS_OPORTUNIDADE,
} from '@/agents/dicionario-tarefas'
import type { MetricasColaboradorMes } from '@/types/gerencial'

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!

// Único rótulo das 12 métricas do painel gerencial que não é escrito pelo
// app de colaboradores (por isso não está em MAPEAMENTO_METRICAS) — é
// digitado à mão pelo CS na própria planilha.
const LABEL_COBERTURA_BASE_TOTAL = 'Cobertura de Base — Total (c/ e s/ reun.)'

// Painel gerencial nunca escreve na planilha operacional — escopo readonly
// reforça essa garantia em código, não só por convenção.
function getAuthOperacionalSomenteLeitura() {
  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON não configurado')
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(credJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
}

// COLABORADORES tem 17 pessoas mas só 15 abaSheet únicas (pares como "Ana e
// Bruna" e "Pedro " compartilham aba). Agregações de time DEVEM iterar esta
// lista, nunca COLABORADORES diretamente — senão os pares entram em dobro.
export function abasUnicas(): string[] {
  return Array.from(new Set(COLABORADORES.map((c) => c.abaSheet)))
}

function indiceDaColuna(letra: string): number {
  return letra.charCodeAt(0) - 'A'.charCodeAt(0)
}

function somarComNulos(valores: (number | null)[]): number | null {
  const presentes = valores.filter((v): v is number => v !== null)
  if (presentes.length === 0) return null
  return presentes.reduce((soma, v) => soma + v, 0)
}

function extrairMetricas(rows: unknown[][], abaSheet: string, mes: number, ano: number): MetricasColaboradorMes {
  const indiceLabel = new Map<string, number>()
  rows.forEach((linha, i) => {
    const label = String(linha[0] ?? '').trim()
    if (label) indiceLabel.set(normalizarLabel(label), i)
  })

  const idxCol = indiceDaColuna(MESES_COLUNAS[mes])

  function celula(labelPlanilha: string): number | null {
    const idxLinha = indiceLabel.get(normalizarLabel(labelPlanilha))
    if (idxLinha === undefined) return null
    const valor = rows[idxLinha]?.[idxCol]
    if (valor === undefined || valor === null || valor === '') return null
    const numero = typeof valor === 'number' ? valor : Number(valor)
    return Number.isNaN(numero) ? null : numero
  }

  function porRotulo(rotulo: string): number | null {
    const labelPlanilha = MAPEAMENTO_METRICAS[rotulo]
    return labelPlanilha ? celula(labelPlanilha) : null
  }

  // Recalculadas em código, nunca lidas das células-fórmula da planilha
  // (comprovadamente inconsistentes entre meses — ver plano de implementação).
  const rotulosReunioes = [...METRICAS_REUNIAO.map((d) => d.rotulo), METRICA_OUTRAS_REUNIOES_CULTIVACAO.rotulo]
  const rotulosOportunidades = METRICAS_OPORTUNIDADE.map((d) => d.rotulo)

  const reunioesCultivacaoRealizadas = somarComNulos(rotulosReunioes.map(porRotulo))
  const oportunidadesTotaisGeradas = somarComNulos(rotulosOportunidades.map(porRotulo))

  const coberturaBaseTotal = celula(LABEL_COBERTURA_BASE_TOTAL)
  const totalContasCarteira = porRotulo('Nº Total de Contas na Carteira')
  // Guardado como número percentual (3.6 = 3,6%), não fração — mesma
  // convenção usada nas metas configuráveis, pra comparar direto sem
  // conversão de unidade em nenhuma outra parte do código.
  const coberturaBasePercentual =
    coberturaBaseTotal !== null && totalContasCarteira !== null && totalContasCarteira !== 0
      ? (coberturaBaseTotal / totalContasCarteira) * 100
      : null

  return {
    abaSheet,
    mes,
    ano,
    churnsRegistrados: porRotulo('Nº Churns Registrados'),
    inadimplentesResgatados: porRotulo('Inadimplentes Resgatados'),
    reunioesCultivacaoRealizadas,
    reuniaoPipeDeRisco: porRotulo('Reunião de Pipe de Risco'),
    reuniaoIAeAutomacoes: porRotulo('Reunião de IA & Automações'),
    reunioesRemarcadasCanceladas: porRotulo('Reuniões Remarcadas / Canceladas'),
    coberturaBaseTotal,
    coberturaBasePercentual,
    oportunidadesTotaisGeradas,
    totalContasCarteira,
    contasExcellent: porRotulo('Contas Excellent'),
    contasGood: porRotulo('Contas Good'),
    contasPoor: porRotulo('Contas Poor'),
    contasBad: porRotulo('Contas Bad'),
  }
}

// Lê, numa única chamada batchGet, a coluna A + as colunas de mês
// necessárias de cada uma das 15 abas únicas. Retorna abaSheet -> mes ->
// métricas. Sob demanda apenas (nunca chamado automaticamente) — quem
// decide quando isso roda é a rota de API, acionada pelo botão "Atualizar".
export async function lerMetricasDasAbas(
  meses: number[],
  ano: number = new Date().getFullYear()
): Promise<Map<string, Map<number, MetricasColaboradorMes>>> {
  const abas = abasUnicas()
  const colMax = MESES_COLUNAS[Math.max(...meses)]

  const auth = getAuthOperacionalSomenteLeitura()
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: abas.map((aba) => `'${aba}'!A:${colMax}`),
    valueRenderOption: 'UNFORMATTED_VALUE',
  })

  const resultado = new Map<string, Map<number, MetricasColaboradorMes>>()

  abas.forEach((aba, i) => {
    const rows = (res.data.valueRanges?.[i]?.values ?? []) as unknown[][]
    const porMes = new Map<number, MetricasColaboradorMes>()
    for (const mes of meses) {
      porMes.set(mes, extrairMetricas(rows, aba, mes, ano))
    }
    resultado.set(aba, porMes)
  })

  return resultado
}

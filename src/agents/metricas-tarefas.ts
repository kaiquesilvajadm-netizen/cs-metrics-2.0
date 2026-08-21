import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { normalizarTexto, valorDaColuna } from './util-linhas'
import {
  METRICAS_REUNIAO,
  METRICA_REMARCADAS,
  METRICA_AGENDAMENTOS_TENTADOS,
  METRICA_REVISOES_DE_CONTAS,
  METRICA_OUTRAS_REUNIOES_CULTIVACAO,
  METRICAS_OPORTUNIDADE,
  METRICA_FECHAMENTOS,
  METRICAS_CHURN_VIA_TAREFAS,
  type DefinicaoMetricaContagem,
} from './dicionario-tarefas'

const COLUNA_COMPROMISSO = 'compromisso'

// ── Detecção de período ───────────────────────────────────────────────────────
// A aba Tarefas só trabalha com o relatório MENSAL. Verifica se o arquivo
// inserido parece mesmo cobrir o mês inteiro, lendo colunas de data da
// planilha e calculando a amplitude em dias — evita que alguém suba por
// engano um relatório semanal (poucos dias) e o sistema conte como se fosse
// o mês completo.
export function detectarPeriodoTarefas(linhas: LinhaPlanilha[]): string | null {
  if (linhas.length < 2) return null

  const timestamps: number[] = []
  for (const linha of linhas) {
    for (const [coluna, valor] of Object.entries(linha)) {
      if (normalizarTexto(coluna) !== 'data') continue
      const ts = parsearData(valor)
      if (ts !== null) timestamps.push(ts)
    }
  }
  if (timestamps.length < 2) return null

  const min = Math.min(...timestamps)
  const max = Math.max(...timestamps)
  const dias = (max - min) / (1000 * 60 * 60 * 24)

  // Mensal: 22–30 dias úteis → amplitude de calendário entre ~20 e 30 dias.
  if (dias > 0 && dias < 15) {
    return `⚠️ A planilha inserida parece cobrir apenas ${Math.round(dias)} dias. A aba Tarefas espera o relatório MENSAL (mês completo, 22 a 30 dias úteis) — verifique se exportou o período correto na ADVBOX.`
  }
  return null
}

function parsearData(valor: unknown): number | null {
  // Excel serial date — intervalo ~2020-2028 (seriais 43831-47483)
  if (typeof valor === 'number' && valor > 43831 && valor < 47483) {
    return (valor - 25569) * 86400 * 1000
  }
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor.getTime()
  if (typeof valor === 'string') {
    const ptBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (ptBR) {
      const ts = new Date(`${ptBR[3]}-${ptBR[2]}-${ptBR[1]}`).getTime()
      return isNaN(ts) ? null : ts
    }
    const iso = valor.match(/^\d{4}-\d{2}-\d{2}/)
    if (iso) {
      const ts = new Date(valor.slice(0, 10)).getTime()
      return isNaN(ts) ? null : ts
    }
  }
  return null
}

// Agrega todas as linhas em uma única entrada com todas as métricas da
// aba Tarefas (não há mais distinção mensal/semanal — é sempre o mês
// completo, e o lançamento na planilha sempre sobrescreve o valor anterior).
export function calcularMetricasTarefas(linhas: LinhaPlanilha[]): MetricaIndividual[] {
  return [calcularParaGrupo(linhas)]
}

function calcularParaGrupo(linhas: LinhaPlanilha[]): MetricaIndividual {
  const contar = (def: DefinicaoMetricaContagem) => contarCompromissos(linhas, def.compromissos)

  const v: Record<string, number> = {}

  // Reuniões
  for (const def of METRICAS_REUNIAO) v[def.rotulo] = contar(def)
  const outrasReunioes = contar(METRICA_OUTRAS_REUNIOES_CULTIVACAO)
  v[METRICA_OUTRAS_REUNIOES_CULTIVACAO.rotulo] = outrasReunioes
  const totalReunioes = somarRotulos(v, METRICAS_REUNIAO) + outrasReunioes

  const remarcadas = contar(METRICA_REMARCADAS)
  v[METRICA_REMARCADAS.rotulo] = remarcadas
  const agendamentos = contar(METRICA_AGENDAMENTOS_TENTADOS)
  v[METRICA_AGENDAMENTOS_TENTADOS.rotulo] = agendamentos
  v['Taxa de Efetivação de Reuniões (%)'] =
    agendamentos > 0 ? (totalReunioes / agendamentos) * 100 : 0

  // Oportunidades, revisões, fechamentos e churn via tarefas
  v[METRICA_REVISOES_DE_CONTAS.rotulo] = contar(METRICA_REVISOES_DE_CONTAS)
  for (const def of METRICAS_OPORTUNIDADE) v[def.rotulo] = contar(def)
  v[METRICA_FECHAMENTOS.rotulo] = contar(METRICA_FECHAMENTOS)
  for (const def of METRICAS_CHURN_VIA_TAREFAS) v[def.rotulo] = contar(def)

  return { colaborador: 'tarefas', origem: 'planilha', valores: v }
}

function contarCompromissos(linhas: LinhaPlanilha[], aceitos: string[]): number {
  const norm = aceitos.map(normalizarTexto)
  return linhas.filter((l) => {
    const c = valorDaColuna(l, COLUNA_COMPROMISSO)
    return c !== null && norm.includes(normalizarTexto(String(c)))
  }).length
}

function somarRotulos(v: Record<string, number>, defs: DefinicaoMetricaContagem[]): number {
  return defs.reduce((s, d) => s + (v[d.rotulo] ?? 0), 0)
}

import type { MetricaIndividual } from '@/types/metricas'
import {
  METRICAS_REUNIAO,
  METRICA_REMARCADAS,
  METRICA_AGENDAMENTOS_TENTADOS,
  METRICA_REVISOES_DE_CONTAS,
  METRICA_OUTRAS_REUNIOES_CULTIVACAO,
  METRICAS_OPORTUNIDADE,
  METRICA_FECHAMENTOS,
  METRICAS_CHURN_VIA_TAREFAS,
  FONTES_POR_ROTULO,
  EXPLICACOES_POR_ROTULO,
} from './dicionario-tarefas'

export interface ValorMetrica {
  rotulo: string
  icone: string
  valor: number
  fontes?: string[]
  explicacao?: string
}

export interface LinhaDashboard {
  colaborador: string
  metricas: ValorMetrica[]
}

const ICONES_DERIVADOS: Record<string, string> = {
  'Taxa de Efetivação de Reuniões (%)': '✅',
  // King Carteira
  'Nº Total de Contas na Carteira': '🏢',
  'Contas Excellent': '🟢',
  'Contas Good': '🔵',
  'Contas Poor': '🟡',
  'Contas Bad': '🔴',
  'MRR Total da Carteira (R$)': '💰',
  // Churn
  'Nº Churns Registrados': '📉',
  'RRM Churn Nominal (R$)': '💸',
  'Life Time Médio dos Churns (meses)': '⏳',
  'LTV Médio Perdido por Churn (R$)': '📊',
  'Churns pós 7º Pagamento — LTV (R$)': '⏱️',
}

const ICONE_POR_ROTULO: Record<string, string> = {
  ...Object.fromEntries(
    [
      ...METRICAS_REUNIAO,
      METRICA_REMARCADAS,
      METRICA_AGENDAMENTOS_TENTADOS,
      METRICA_REVISOES_DE_CONTAS,
      METRICA_OUTRAS_REUNIOES_CULTIVACAO,
      ...METRICAS_OPORTUNIDADE,
      METRICA_FECHAMENTOS,
      ...METRICAS_CHURN_VIA_TAREFAS,
    ].map((definicao) => [definicao.rotulo, definicao.icone])
  ),
  ...ICONES_DERIVADOS,
}

function iconeDaMetrica(rotulo: string): string {
  return ICONE_POR_ROTULO[rotulo] ?? '📌'
}

// Agente de Relatório
// Junta as métricas vindas da planilha com as preenchidas manualmente,
// somando os valores quando o mesmo colaborador/métrica aparece em mais de
// uma fonte (ex: "Fechamentos de Ops no Mês" pode ter um ajuste manual que
// se soma à contagem automática da planilha, conforme pedido na planilha
// de instruções).
export function montarRelatorio(metricas: MetricaIndividual[]): LinhaDashboard[] {
  const valoresPorColaborador = new Map<string, Record<string, number>>()

  for (const metrica of metricas) {
    const valoresAtuais = valoresPorColaborador.get(metrica.colaborador) ?? {}

    for (const [rotulo, valor] of Object.entries(metrica.valores)) {
      valoresAtuais[rotulo] = (valoresAtuais[rotulo] ?? 0) + valor
    }

    valoresPorColaborador.set(metrica.colaborador, valoresAtuais)
  }

  return Array.from(valoresPorColaborador.entries()).map(([colaborador, valores]) => ({
    colaborador,
    metricas: Object.entries(valores).map(([rotulo, valor]) => ({
      rotulo,
      icone: iconeDaMetrica(rotulo),
      valor,
      fontes: FONTES_POR_ROTULO[rotulo],
      explicacao: EXPLICACOES_POR_ROTULO[rotulo],
    })),
  }))
}

export function formatarValorMetrica(rotulo: string, valor: number): string {
  if (rotulo.includes('(%)')) return `${valor.toFixed(1)}%`
  if (rotulo.includes('(R$)')) return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  if (rotulo.toLowerCase().includes('médio')) return valor.toFixed(2)
  return String(Math.round(valor))
}

import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { agruparPorColuna, extrairNumeroDaColuna, media, somar, COLUNA_COLABORADOR_KING } from './util-linhas'

const COLUNA_LIFETIME = 'lifetime'
const COLUNA_LTV = 'ltv'
const COLUNA_VALOR_ASSINATURA = 'valor da assinatura'

// TODO: confirmar se "pós 7º pagamento" deve mesmo ser aproximado por
// Lifetime >= 7 meses (assumindo cobrança mensal, 1 pagamento por mês).
const LIFETIME_MINIMO_PARA_POS_7_PAGAMENTOS = 7

// Agente de Métricas — Planilha King (churn)
// Agrupa os registros de churn por colaborador (coluna "Colaborador
// (I.S.)") e calcula as 5 métricas financeiras da categoria Retenção &
// Churn descritas na planilha de instruções.
export function calcularMetricasKing(linhas: LinhaPlanilha[]): MetricaIndividual[] {
  const porColaborador = agruparPorColuna(linhas, COLUNA_COLABORADOR_KING)

  return Array.from(porColaborador.entries()).map(([colaborador, linhasDoColaborador]) => {
    const lifetimes = numerosDaColuna(linhasDoColaborador, COLUNA_LIFETIME)
    const ltvs = numerosDaColuna(linhasDoColaborador, COLUNA_LTV)
    const valoresDeAssinatura = numerosDaColuna(linhasDoColaborador, COLUNA_VALOR_ASSINATURA)

    const ltvsPos7Pagamentos = linhasDoColaborador
      .filter((linha) => (extrairNumeroDaColuna(linha, COLUNA_LIFETIME) ?? 0) >= LIFETIME_MINIMO_PARA_POS_7_PAGAMENTOS)
      .map((linha) => extrairNumeroDaColuna(linha, COLUNA_LTV) ?? 0)

    const valores: Record<string, number> = {
      'Nº Churns Registrados': linhasDoColaborador.length,
      'RRM Churn Nominal (R$)': somar(valoresDeAssinatura),
      'Life Time Médio dos Churns (meses)': media(lifetimes),
      'LTV Médio Perdido por Churn (R$)': media(ltvs),
      'Churns pós 7º Pagamento — LTV (R$)': somar(ltvsPos7Pagamentos),
    }

    return { colaborador, origem: 'planilha', valores }
  })
}

function numerosDaColuna(linhas: LinhaPlanilha[], nomeColunaNormalizado: string): number[] {
  return linhas
    .map((linha) => extrairNumeroDaColuna(linha, nomeColunaNormalizado))
    .filter((numero): numero is number => numero !== null)
}

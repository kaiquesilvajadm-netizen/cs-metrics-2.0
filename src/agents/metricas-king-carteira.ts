import type { LinhaPlanilha, MetricaIndividual } from '@/types/metricas'
import { valorDaColuna, extrairNumeroDaColuna, somar } from './util-linhas'

const COLUNA_ID       = 'id da conta'
const COLUNA_HEALTH   = 'health score'
const COLUNA_ASSINATURA = 'assinatura'

// Agente de Métricas — Planilha King (Carteira)
// Lê a exportação do King na ADVBOX (já filtrada pelo colaborador) e calcula
// 6 indicadores de saúde da carteira.
// A planilha tem duas colunas "Assinatura" (R$ e data); a limpeza deduplica
// os nomes para "Assinatura" e "Assinatura_2", garantindo que apenas o valor
// monetário seja somado no MRR.
export function calcularMetricasKingCarteira(linhas: LinhaPlanilha[]): MetricaIndividual[] {
  const ids = new Set<string>()
  for (const linha of linhas) {
    const id = valorDaColuna(linha, COLUNA_ID)
    if (id !== null && id !== undefined) ids.add(String(id).trim())
  }

  const porHealth: Record<string, number> = { Excellent: 0, Good: 0, Poor: 0, Bad: 0 }
  for (const linha of linhas) {
    const hs = valorDaColuna(linha, COLUNA_HEALTH)
    if (hs === null || hs === undefined) continue
    const hsStr = String(hs).trim()
    if (hsStr in porHealth) porHealth[hsStr]++
  }

  const mrr = somar(
    linhas
      .map((l) => extrairNumeroDaColuna(l, COLUNA_ASSINATURA) ?? 0)
      .filter((n) => n > 0)
  )

  const valores: Record<string, number> = {
    'Nº Total de Contas na Carteira': ids.size,
    'Contas Excellent': porHealth['Excellent'],
    'Contas Good': porHealth['Good'],
    'Contas Poor': porHealth['Poor'],
    'Contas Bad': porHealth['Bad'],
    'MRR Total da Carteira (R$)': mrr,
  }

  return [{ colaborador: 'carteira', origem: 'planilha', valores }]
}

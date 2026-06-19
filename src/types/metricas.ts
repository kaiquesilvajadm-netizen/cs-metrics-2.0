// Tipos compartilhados entre os agentes (importação, limpeza, métricas, relatório)
// e os componentes da interface.

export type LinhaPlanilha = Record<string, unknown>

export type OrigemMetrica = 'planilha' | 'manual'

export interface MetricaIndividual {
  colaborador: string
  origem: OrigemMetrica
  valores: Record<string, number>
}

// Tipos do painel gerencial (/gerencial) — dashboard do líder, separado do
// fluxo de colaboradores. Lê a planilha operacional (somente leitura) e lê/
// escreve numa planilha gerencial dedicada (metas + meses fechados).

export interface MetricasColaboradorMes {
  abaSheet: string
  mes: number
  ano: number
  churnsRegistrados: number | null
  inadimplentesResgatados: number | null
  reunioesCultivacaoRealizadas: number | null // calculado: soma de 7 sub-itens de reunião
  reuniaoPipeDeRisco: number | null
  reuniaoIAeAutomacoes: number | null
  reunioesRemarcadasCanceladas: number | null
  coberturaBaseTotal: number | null // valor bruto da planilha (numerador da %)
  coberturaBasePercentual: number | null // calculado: coberturaBaseTotal / totalContasCarteira
  oportunidadesTotaisGeradas: number | null // calculado: soma de 5 sub-itens de oportunidade
  totalContasCarteira: number | null // denominador da Cobertura de Base
  contasExcellent: number | null
  contasGood: number | null
  contasPoor: number | null
  contasBad: number | null
}

export type ChaveMetrica = Exclude<keyof MetricasColaboradorMes, 'abaSheet' | 'mes' | 'ano'>

export type DirecaoMeta = 'maior_melhor' | 'menor_melhor'
export type AgregacaoPeriodo = 'soma' | 'media' | 'ultimo_valor'

// Nível em que uma meta foi configurada. O líder escolhe, ao preencher
// Métricas Esperadas, se está definindo o alvo do mês, do trimestre ou do
// ano — cada nível fica numa coluna própria na planilha gerencial.
export type NivelMeta = 'mes' | 'trimestre' | 'ano'

export interface DefinicaoMeta {
  chave: string
  rotulo: string
  unidade: 'quantidade' | 'percentual'
  direcao: DirecaoMeta
  agregacaoPeriodo: AgregacaoPeriodo
}

export type StatusIndicador = 'ok' | 'atencao' | 'critico' | 'sem_meta'

export interface IndicadorTime {
  chave: string
  rotulo: string
  realizado: number | null
  meta: number | null
  percentualAtingimento: number | null
  status: StatusIndicador
}

export interface ResultadoTime {
  mes: number
  ano: number
  abasComDado: number
  totalAbas: number
  indicadores: IndicadorTime[]
}

export interface ResultadoPeriodoTime {
  meses: number[]
  ano: number
  mesesFechados: number[]
  mesesFaltando: number[]
  indicadores: IndicadorTime[]
}

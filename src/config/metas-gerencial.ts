import type { AgregacaoPeriodo, ChaveMetrica, DefinicaoMeta, DirecaoMeta } from '@/types/gerencial'

// Nome da aba de metas na planilha GERENCIAL (dedicada, separada da
// operacional). Mesma estrutura de colunas de mês (A=MÉTRICA, B=vazio,
// C-N=Jan-Dez) usada em toda a planilha operacional — reaproveita
// MESES_COLUNAS sem nenhuma lógica nova de coluna.
export const ABA_METAS = 'Metas do Time'
export const ABA_FECHAMENTOS = 'Fechamentos Mensais'

export const METAS_CONFIG: DefinicaoMeta[] = [
  {
    chave: 'totalContasAdvbox',
    rotulo: 'Meta — Total de Contas na ADVBOX',
    unidade: 'quantidade',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
  },
  {
    chave: 'reunioesEsperadas',
    rotulo: 'Meta — Reuniões de Cultivação (mês)',
    unidade: 'quantidade',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
  },
  {
    chave: 'churnEsperadoPercentual',
    rotulo: 'Meta — Churn (%)',
    unidade: 'percentual',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'media',
  },
]

// Rótulo de exibição + ícone + relação com a meta (quando aplicável) para
// cada métrica que o time acompanha nos Menus 3/4. `chaveMeta` liga a
// métrica realizada à meta configurada em METAS_CONFIG — quando ausente, o
// indicador é exibido sem comparação (não há meta definida para ele).
export interface DefinicaoIndicador {
  chave: ChaveMetrica
  rotulo: string
  icone: string
  chaveMeta?: string
  direcao: DirecaoMeta
  // Como consolidar a métrica ao longo de vários meses (trimestre/ano):
  // 'soma' para fluxos (churns do mês, reuniões do mês, etc), 'ultimo_valor'
  // para fotos/estoques (tamanho da carteira, distribuição de health score —
  // somar isso entre meses triplicaria a carteira, não faz sentido).
  // coberturaBasePercentual é tratada à parte (sempre recalculada a partir
  // dos outros dois campos, nunca somada/mediada diretamente).
  agregacaoPeriodo: AgregacaoPeriodo
}

export const INDICADORES_TIME: DefinicaoIndicador[] = [
  { chave: 'churnsRegistrados', rotulo: 'Nº Churns Registrados', icone: '📉', direcao: 'menor_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'inadimplentesResgatados', rotulo: 'Inadimplentes Resgatados', icone: '💳', direcao: 'maior_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'reunioesCultivacaoRealizadas', rotulo: 'Reuniões de Cultivação Realizadas', icone: '🤝', chaveMeta: 'reunioesEsperadas', direcao: 'maior_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'reuniaoPipeDeRisco', rotulo: 'Reunião de Pipe de Risco', icone: '⚠️', direcao: 'maior_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'reuniaoIAeAutomacoes', rotulo: 'Reunião de IA & Automações', icone: '🤖', direcao: 'maior_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'reunioesRemarcadasCanceladas', rotulo: 'Reuniões Remarcadas / Canceladas', icone: '🔁', direcao: 'menor_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'coberturaBasePercentual', rotulo: 'Cobertura de Base (%)', icone: '📡', direcao: 'maior_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'oportunidadesTotaisGeradas', rotulo: 'Oportunidades Totais Geradas', icone: '🟢', direcao: 'maior_melhor', agregacaoPeriodo: 'soma' },
  { chave: 'totalContasCarteira', rotulo: 'Nº Total de Contas na Carteira', icone: '🏢', chaveMeta: 'totalContasAdvbox', direcao: 'maior_melhor', agregacaoPeriodo: 'ultimo_valor' },
  { chave: 'contasExcellent', rotulo: 'Contas Excellent', icone: '🟢', direcao: 'maior_melhor', agregacaoPeriodo: 'ultimo_valor' },
  { chave: 'contasGood', rotulo: 'Contas Good', icone: '🔵', direcao: 'maior_melhor', agregacaoPeriodo: 'ultimo_valor' },
  { chave: 'contasPoor', rotulo: 'Contas Poor', icone: '🟡', direcao: 'menor_melhor', agregacaoPeriodo: 'ultimo_valor' },
  { chave: 'contasBad', rotulo: 'Contas Bad', icone: '🔴', direcao: 'menor_melhor', agregacaoPeriodo: 'ultimo_valor' },
]

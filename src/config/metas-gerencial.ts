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
  // Texto do tooltip "?" explicando de onde o número vem — mostrado nos
  // Menus 3 e 4.
  explicacao: string
}

export const INDICADORES_TIME: DefinicaoIndicador[] = [
  {
    chave: 'churnsRegistrados',
    rotulo: 'Nº Churns Registrados',
    icone: '📉',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da coluna "Nº Churns Registrados" de todas as abas de colaborador (valor já calculado pelo app na exportação da Planilha King).',
  },
  {
    chave: 'inadimplentesResgatados',
    rotulo: 'Inadimplentes Resgatados',
    icone: '💳',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da coluna "Inadimplentes Resgatados" de todas as abas de colaborador.',
  },
  {
    chave: 'reunioesCultivacaoRealizadas',
    rotulo: 'Reuniões de Cultivação Realizadas',
    icone: '🤝',
    chaveMeta: 'reunioesEsperadas',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao:
      'Recalculado somando as 7 linhas de sub-tipos de reunião (Implantação Elite, Kick-Off, Engajamento, Pipe de Risco, IA & Automações, Diagnóstico Radar, Outras) de cada colaborador — não usa a célula de total da planilha, que tem fórmula inconsistente entre meses.',
  },
  {
    chave: 'reuniaoPipeDeRisco',
    rotulo: 'Reunião de Pipe de Risco',
    icone: '⚠️',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da linha "↳ Reunião de Pipe de Risco" de todas as abas de colaborador.',
  },
  {
    chave: 'reuniaoIAeAutomacoes',
    rotulo: 'Reunião de IA & Automações',
    icone: '🤖',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da linha "↳ Reunião de IA & Automações" de todas as abas de colaborador.',
  },
  {
    chave: 'reunioesRemarcadasCanceladas',
    rotulo: 'Reuniões Remarcadas / Canceladas',
    icone: '🔁',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da coluna "Reuniões Remarcadas / Canceladas" de todas as abas de colaborador.',
  },
  {
    chave: 'coberturaBasePercentual',
    rotulo: 'Cobertura de Base (%)',
    icone: '📡',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao:
      'Soma de "Cobertura de Base — Total" de todos os colaboradores, dividida pela soma de "Nº Total de Contas na Carteira" de todos — média ponderada pelo tamanho de cada carteira, não a média simples das porcentagens individuais de cada colaborador.',
  },
  {
    chave: 'oportunidadesTotaisGeradas',
    rotulo: 'Oportunidades Totais Geradas',
    icone: '🟢',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao:
      'Recalculado somando as 5 linhas de sub-tipos de oportunidade (Upgrades, Cross-Sell, IA, API, Eventos) de cada colaborador — não usa a célula de total da planilha.',
  },
  {
    chave: 'totalContasCarteira',
    rotulo: 'Nº Total de Contas na Carteira',
    icone: '🏢',
    chaveMeta: 'totalContasAdvbox',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Nº Total de Contas na Carteira" de todas as abas de colaborador — é uma foto do tamanho da carteira, não um fluxo do mês.',
  },
  {
    chave: 'contasExcellent',
    rotulo: 'Contas Excellent',
    icone: '🟢',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Excellent" (Health Score) de todas as abas de colaborador.',
  },
  {
    chave: 'contasGood',
    rotulo: 'Contas Good',
    icone: '🔵',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Good" (Health Score) de todas as abas de colaborador.',
  },
  {
    chave: 'contasPoor',
    rotulo: 'Contas Poor',
    icone: '🟡',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Poor" (Health Score) de todas as abas de colaborador.',
  },
  {
    chave: 'contasBad',
    rotulo: 'Contas Bad',
    icone: '🔴',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Bad" (Health Score) de todas as abas de colaborador.',
  },
]

export function notaAgregacaoPeriodo(agregacao: AgregacaoPeriodo): string {
  if (agregacao === 'soma') return 'No trimestre/ano, este valor é a soma de todos os meses já fechados do período.'
  if (agregacao === 'media') return 'No trimestre/ano, este valor é a média dos meses já fechados do período.'
  return 'No trimestre/ano, este valor usa só o mês fechado mais recente do período — é uma foto, somar entre meses não faria sentido.'
}

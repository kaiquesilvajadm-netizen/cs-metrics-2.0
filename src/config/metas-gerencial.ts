import type { AgregacaoPeriodo, ChaveMetrica, DefinicaoMeta, DirecaoMeta } from '@/types/gerencial'

// Nome da aba de metas na planilha GERENCIAL (dedicada, separada da
// operacional). Colunas: A=MÉTRICA, B=vazio, C-N=Jan-Dez (reaproveita
// MESES_COLUNAS), O-R=Q1-Q4, S=ANO — o líder escolhe em que nível está
// configurando cada meta (Mês / Trimestre / Ano).
export const ABA_METAS = 'Metas do Time'
export const ABA_FECHAMENTOS = 'Fechamentos Mensais'

export const COLUNAS_TRIMESTRE: Record<'Q1' | 'Q2' | 'Q3' | 'Q4', string> = {
  Q1: 'O',
  Q2: 'P',
  Q3: 'Q',
  Q4: 'R',
}
export const COLUNA_ANO = 'S'

// Rótulo de exibição + ícone + relação com a meta para cada métrica que o
// time acompanha nos Menus 1/3/4. Toda métrica tem uma meta correspondente
// (chaveMeta = chave + "Meta") — o líder decide o nível (mês/trimestre/ano)
// na tela de Métricas Esperadas.
export interface DefinicaoIndicador {
  chave: ChaveMetrica
  rotulo: string
  icone: string
  chaveMeta: string
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
    chave: 'churnPercentual',
    rotulo: 'Churn (%)',
    icone: '📉',
    chaveMeta: 'churnPercentualMeta',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'soma',
    explicacao:
      'Soma de "Nº Churns Registrados" de todos os colaboradores, dividida pela soma de "Nº Total de Contas na Carteira" de todos — média ponderada pelo tamanho de cada carteira, mesma lógica de Cobertura de Base (%). Não é a contagem crua de churns, é o percentual da base.',
  },
  {
    chave: 'inadimplentesResgatados',
    rotulo: 'Inadimplentes Resgatados',
    icone: '💳',
    chaveMeta: 'inadimplentesResgatadosMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da coluna "Inadimplentes Resgatados" de todas as abas de colaborador.',
  },
  {
    chave: 'reunioesCultivacaoRealizadas',
    rotulo: 'Reuniões de Cultivação Realizadas',
    icone: '🤝',
    chaveMeta: 'reunioesCultivacaoRealizadasMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao:
      'Recalculado somando as 7 linhas de sub-tipos de reunião (Implantação Elite, Kick-Off, Engajamento, Pipe de Risco, IA & Automações, Diagnóstico Radar, Outras) de cada colaborador — não usa a célula de total da planilha, que tem fórmula inconsistente entre meses.',
  },
  {
    chave: 'reuniaoPipeDeRisco',
    rotulo: 'Reunião de Pipe de Risco',
    icone: '⚠️',
    chaveMeta: 'reuniaoPipeDeRiscoMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da linha "↳ Reunião de Pipe de Risco" de todas as abas de colaborador.',
  },
  {
    chave: 'reuniaoIAeAutomacoes',
    rotulo: 'Reunião de IA & Automações',
    icone: '🤖',
    chaveMeta: 'reuniaoIAeAutomacoesMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da linha "↳ Reunião de IA & Automações" de todas as abas de colaborador.',
  },
  {
    chave: 'reunioesRemarcadasCanceladas',
    rotulo: 'Reuniões Remarcadas / Canceladas',
    icone: '🔁',
    chaveMeta: 'reunioesRemarcadasCanceladasMeta',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'soma',
    explicacao: 'Soma da coluna "Reuniões Remarcadas / Canceladas" de todas as abas de colaborador.',
  },
  {
    chave: 'coberturaBasePercentual',
    rotulo: 'Cobertura de Base (%)',
    icone: '📡',
    chaveMeta: 'coberturaBasePercentualMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao:
      'Soma de "Cobertura de Base — Total" de todos os colaboradores, dividida pela soma de "Nº Total de Contas na Carteira" de todos — média ponderada pelo tamanho de cada carteira, não a média simples das porcentagens individuais de cada colaborador.',
  },
  {
    chave: 'oportunidadesTotaisGeradas',
    rotulo: 'Oportunidades Totais Geradas',
    icone: '🟢',
    chaveMeta: 'oportunidadesTotaisGeradasMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'soma',
    explicacao:
      'Recalculado somando as 5 linhas de sub-tipos de oportunidade (Upgrades, Cross-Sell, IA, API, Eventos) de cada colaborador — não usa a célula de total da planilha.',
  },
  {
    chave: 'totalContasCarteira',
    rotulo: 'Nº Total de Contas na Carteira',
    icone: '🏢',
    chaveMeta: 'totalContasCarteiraMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Nº Total de Contas na Carteira" de todas as abas de colaborador — é uma foto do tamanho da carteira, não um fluxo do mês.',
  },
  {
    chave: 'contasExcellent',
    rotulo: 'Contas Excellent',
    icone: '🟢',
    chaveMeta: 'contasExcellentMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Excellent" (Health Score) de todas as abas de colaborador.',
  },
  {
    chave: 'contasGood',
    rotulo: 'Contas Good',
    icone: '🔵',
    chaveMeta: 'contasGoodMeta',
    direcao: 'maior_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Good" (Health Score) de todas as abas de colaborador.',
  },
  {
    chave: 'contasPoor',
    rotulo: 'Contas Poor',
    icone: '🟡',
    chaveMeta: 'contasPoorMeta',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Poor" (Health Score) de todas as abas de colaborador.',
  },
  {
    chave: 'contasBad',
    rotulo: 'Contas Bad',
    icone: '🔴',
    chaveMeta: 'contasBadMeta',
    direcao: 'menor_melhor',
    agregacaoPeriodo: 'ultimo_valor',
    explicacao: 'Soma da coluna "Contas Bad" (Health Score) de todas as abas de colaborador.',
  },
]

// Uma meta por indicador, derivada 1:1 de INDICADORES_TIME — "tudo que
// aparece em Resultado Mensal/Trimestral tem uma meta configurável em
// Métricas Esperadas" (decisão confirmada).
export const METAS_CONFIG: DefinicaoMeta[] = INDICADORES_TIME.map((def) => ({
  chave: def.chaveMeta,
  rotulo: `Meta — ${def.rotulo}`,
  unidade: def.rotulo.includes('(%)') ? 'percentual' : 'quantidade',
  direcao: def.direcao,
  agregacaoPeriodo: def.agregacaoPeriodo,
}))

export function notaAgregacaoPeriodo(agregacao: AgregacaoPeriodo): string {
  if (agregacao === 'soma') return 'No trimestre/ano, este valor é a soma de todos os meses já fechados do período.'
  if (agregacao === 'media') return 'No trimestre/ano, este valor é a média dos meses já fechados do período.'
  return 'No trimestre/ano, este valor usa só o mês fechado mais recente do período — é uma foto, somar entre meses não faria sentido.'
}

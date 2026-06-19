// Dicionário de métricas calculadas a partir da Planilha de Tarefas.
// Transcrito da planilha de instruções (aba "Página2"): cada métrica de
// contagem soma quantas linhas têm a coluna "Compromisso" igual a um dos
// nomes listados (quando há mais de um, separados por ";" na planilha
// original).
export interface DefinicaoMetricaContagem {
  rotulo: string
  icone: string
  compromissos: string[]
}

export const METRICAS_REUNIAO: DefinicaoMetricaContagem[] = [
  {
    rotulo: 'Reunião de Implantação Elite',
    icone: '🤝',
    compromissos: ['CULTI REUNIÃO DE IMPLANTAÇÃO ELITE'],
  },
  {
    rotulo: 'Reunião de Kick-Off',
    icone: '🚀',
    compromissos: ['REUNIÃO INICIAL KICKOFF DE CULTIVAÇÃO'],
  },
  {
    rotulo: 'Reunião de Engajamento',
    icone: '💬',
    compromissos: ['CSC REUNIÃO ENGAJAMENTO'],
  },
  {
    rotulo: 'Reunião de Pipe de Risco',
    icone: '⚠️',
    compromissos: ['CS REUNIÃO CONTA PIPE DE RISCO'],
  },
  {
    rotulo: 'Reunião de IA & Automações',
    icone: '🤖',
    compromissos: [
      'CS REUNIÃO DE IA E AUTOMAÇÕES',
      'CSA REUNIÃO DONN@ E JUSTIN-E',
      'CSA REUNIÃO AGENTE DE PETICIONAMENTO',
      'CSA REUNIÃO FLOWTERS + API',
      'CS REUNIÃO AUTOMAÇÕES E API',
      'CS REUNIÃO DE ADOÇÃO PACK INTELIGENTE',
      'CS REUNIÃO DE AJUSTES TÉCNICOS INTERNOS',
      'CS REUNIÃO OFFBOARDING DE CLIENTES',
    ],
  },
  {
    rotulo: 'Diagnóstico Radar',
    icone: '📡',
    compromissos: ['CSA DEVOLUTIVA RADAR'],
  },
]

export const METRICA_REMARCADAS: DefinicaoMetricaContagem = {
  rotulo: 'Reuniões Remarcadas / Canceladas',
  icone: '🔁',
  compromissos: ['CS REMARCAR REUNIAO CULTIVACAO'],
}

export const METRICA_AGENDAMENTOS_TENTADOS: DefinicaoMetricaContagem = {
  rotulo: 'Agendamentos Tentados',
  icone: '📅',
  compromissos: [
    'AGENDAR REUNIAO CULTIVACAO',
    'AGENDAR REUNIÃO PACOTE INTELIGENTE',
    'AGENDAR REUNIÃO CONSULTORIA',
  ],
}

// TODO: a planilha de instruções diz "soma de todas as tarefas de reuniões
// feitas E [estes itens]" para esta métrica, mas o nome dela ("Checklist SEM
// reunião") sugere que reuniões não deveriam entrar na soma — parece ter
// sobrado da fórmula de cancelamento na célula de cima. Por ora somamos só
// os itens de plano de ação / cobertura sem reunião listados abaixo.
// Confirmar com o time qual das duas leituras está certa.
export const METRICA_REVISOES_DE_CONTAS: DefinicaoMetricaContagem = {
  rotulo: 'Revisões de Contas (Checklist s/ reunião)',
  icone: '📝',
  compromissos: [
    'PLANO DE AÇÃO - OTIMIZAÇÃO',
    'CSC PLANO DE AÇÃO - ENGAJAMENTO',
    'CSC PLANO DE AÇÃO - CULTIVAÇÃO INICIADA',
    'CSC PLANO DE AÇÃO - ADOÇÃO',
    'CSC COBERTURA DE BASE SEM REUNIÃO',
  ],
}

export const METRICAS_OPORTUNIDADE: DefinicaoMetricaContagem[] = [
  {
    rotulo: 'Upgrades de Plano',
    icone: '⬆️',
    compromissos: [
      'CULTI OPORTUNIDADE DE UPGRADE',
      'OPORTUNIDADE UPGRADE',
      'OPORTUNIDADE UPGRADE ELITE',
      'CS OPORTUNIDADE DEGUSTAÇÃO ELITE',
    ],
  },
  {
    rotulo: 'Cross-Sell (Consultorias / BigBoss)',
    icone: '🧩',
    compromissos: ['OPORTUNIDADE BIG BOSS'],
  },
  {
    rotulo: 'Oportunidade de IA (Justine/Dona/Flowter)',
    icone: '🤖',
    compromissos: [
      'OPORTUNIDADE JUSTINE',
      'OPORTUNIDADE DONNA',
      'OPORTUNIDADE AGENTE',
      'OPORTUNIDADE FLOWTER/API',
      'OPORTUNIDADE PACOTE INTELIGENTE',
      'OPORTUNIDADE PREVIDIA',
    ],
  },
  {
    rotulo: 'Oportunidade de API (pagas)',
    icone: '🔌',
    compromissos: ['CS OPORTUNIDADE API'],
  },
  {
    rotulo: 'Eventos / Comunidade / Parceiros',
    icone: '🎉',
    compromissos: [
      'OPORTUNIDADE PARA EVENTOS',
      'CS INDICAÇÃO ALAN HONJOYA',
      'CS INDICAÇÃO CRIS ADV10X',
      'CS INDICAÇÃO EURO JR',
      'CS INDICAÇÃO FLAVIA MARINHO',
      'CS INDICAÇÃO FRED PATARO',
      'CS INDICAÇÃO RAFAEL MOTA',
      'CS INDICAÇÃO RICCIARDI',
      'CS INDICAÇÃO VALERIA GUI',
    ],
  },
]

export const METRICA_OUTRAS_REUNIOES_CULTIVACAO: DefinicaoMetricaContagem = {
  rotulo: 'Outras Reuniões de Cultivação',
  icone: '🌱',
  compromissos: ['CS REATIVAÇÃO BM', 'CS REATIVAÇÃO BJ'],
}

export const METRICA_FECHAMENTOS: DefinicaoMetricaContagem = {
  rotulo: 'Fechamentos de Ops no Mês',
  icone: '💰',
  compromissos: [
    'fechamento oportunidade pacote inteligente',
    'fechamento oportunidade Flowter',
    'fechamento oportunidade IA',
    'fechamento oportunidade previdia',
    'CULTI UPGRADE BJ FECHADO',
    'CULTI UPGRADE BMAX FECHADO',
    'CULTI UPGRADE ELITE FECHADO',
  ],
}

// Estas duas aparecem na categoria "Retenção & Churn" mas, segundo a
// planilha de instruções, vêm da Planilha de Tarefas (não da Planilha King).
export const METRICAS_CHURN_VIA_TAREFAS: DefinicaoMetricaContagem[] = [
  {
    rotulo: 'Churns Resgatados',
    icone: '🛟',
    compromissos: ['CS RESGATE DE CHURN EFETUADO'],
  },
  {
    rotulo: 'Inadimplentes Resgatados',
    icone: '💳',
    compromissos: ['Cs Resgate de Atrasados e Inadimplentes'],
  },
]

// Métricas marcadas como SEMANAL na coluna FREQUENCIA da planilha de instruções.
// O toggle Semanal exibe SOMENTE estas; o toggle Mensal exibe todas.
export const ROTULOS_SEMANAL = new Set<string>([
  ...METRICAS_REUNIAO.map((d) => d.rotulo),
  METRICA_REMARCADAS.rotulo,
  METRICA_AGENDAMENTOS_TENTADOS.rotulo,
  METRICA_OUTRAS_REUNIOES_CULTIVACAO.rotulo,
  'Taxa de Efetivação de Reuniões (%)',
])

// Mapa rotulo → lista de nomes de tarefa (Compromisso) que entram na contagem.
// Exibido no tooltip "?" de cada métrica no dashboard.
export const FONTES_POR_ROTULO: Record<string, string[]> = Object.fromEntries(
  [
    ...METRICAS_REUNIAO,
    METRICA_REMARCADAS,
    METRICA_AGENDAMENTOS_TENTADOS,
    METRICA_REVISOES_DE_CONTAS,
    METRICA_OUTRAS_REUNIOES_CULTIVACAO,
    ...METRICAS_OPORTUNIDADE,
    METRICA_FECHAMENTOS,
    ...METRICAS_CHURN_VIA_TAREFAS,
  ].map((def) => [def.rotulo, def.compromissos])
)

// Métricas derivadas (calculadas por fórmula) e métricas da Planilha King.
export const EXPLICACOES_POR_ROTULO: Record<string, string> = {
  // Derivadas — Tarefas
  'Taxa de Efetivação de Reuniões (%)':
    'Fórmula: total de reuniões realizadas ÷ agendamentos tentados × 100. Mede quantos dos agendamentos tentados resultaram em reunião efetivamente realizada.',
  // Métricas da Planilha King (Carteira)
  'Nº Total de Contas na Carteira':
    'Quantidade de IDs únicos na coluna "ID da Conta" da planilha exportada.',
  'Contas Excellent':
    'Quantidade de contas com Health Score = Excellent na carteira.',
  'Contas Good':
    'Quantidade de contas com Health Score = Good na carteira.',
  'Contas Poor':
    'Quantidade de contas com Health Score = Poor na carteira.',
  'Contas Bad':
    'Quantidade de contas com Health Score = Bad na carteira.',
  'MRR Total da Carteira (R$)':
    'Soma de todos os valores da coluna "Assinatura" (receita recorrente mensal da carteira).',
  // Métricas da Planilha Churn — coluna de origem entre parênteses
  'Nº Churns Registrados':
    'Total de registros (linhas) da Planilha King para o colaborador selecionado.',
  'RRM Churn Nominal (R$)':
    'Soma de todos os valores da coluna "Valor da assinatura".',
  'Life Time Médio dos Churns (meses)':
    'Média da coluna "Lifetime": soma dos meses de todos os churns ÷ quantidade de linhas.',
  'LTV Médio Perdido por Churn (R$)':
    'Média da coluna "LTV": soma do LTV de todos os churns ÷ quantidade de linhas.',
  'Churns pós 7º Pagamento — LTV (R$)':
    'Soma do LTV apenas dos churns com Lifetime ≥ 7 meses (≈ 7 pagamentos mensais).',
}

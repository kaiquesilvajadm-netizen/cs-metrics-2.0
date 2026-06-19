// Mapa: rótulo da métrica no app → label na coluna A da planilha operacional.
// Remove o prefixo "↓ " que a planilha usa para sub-itens antes de comparar.
export const MAPEAMENTO_METRICAS: Record<string, string> = {
  // ── CHURN (Planilha King) ─────────────────────────────────────────────────
  'Nº Churns Registrados':               'Nº Churns Registrados',
  'RRM Churn Nominal (R$)':              'RRM Churn Nominal (R$)',
  'Life Time Médio dos Churns (meses)':  'Life Time Médio dos Churns (meses)',
  'LTV Médio Perdido por Churn (R$)':    'LTV Médio Perdido por Churn (R$)',
  'Churns pós 7º Pagamento — LTV (R$)': 'Churns pós 7º Pagamento — LTV (R$)',

  // ── CHURN via Tarefas ─────────────────────────────────────────────────────
  'Churns Resgatados':       'Churns Resgatados',
  'Inadimplentes Resgatados':'Inadimplentes Resgatados',

  // ── ENGAJAMENTO & COBERTURA (Planilha Tarefas) ───────────────────────────
  'Reunião de Implantação Elite':          'Reunião de Implantação Elite',
  'Reunião de Kick-Off':                   'Reunião de Kick-Off',
  'Reunião de Engajamento':                'Reunião de Engajamento',
  'Reunião de Pipe de Risco':              'Reunião de Pipe de Risco',
  'Reunião de IA & Automações':            'Reunião de IA & Automações',
  'Diagnóstico Radar':                     'Diagnóstico Radar',
  'Outras Reuniões de Cultivação':         'Outras Reuniões de Cultivação',
  'Reuniões Remarcadas / Canceladas':      'Reuniões Remarcadas / Canceladas',
  'Agendamentos Tentados':                 'Agendamentos Tentados',
  'Revisões de Contas (Checklist s/ reunião)': 'Revisões de Contas (Checklist s/ reunião)',

  // ── OPORTUNIDADES ─────────────────────────────────────────────────────────
  'Upgrades de Plano':                          'Upgrades de Plano',
  'Cross-Sell (Consultorias / BigBoss)':        'Cross-Sell (Consultorias / BigBoss)',
  'Oportunidade de IA (Justine/Dona/Flowter)':  'Oportunidade de IA (Justine/Dona/Flowter)',
  'Oportunidade de API (pagas)':                'Oportunidade de API (pagas)',
  'Eventos / Comunidade / Parceiros':           'Eventos / Comunidade / Parceiros',
  'Fechamentos de Ops no Mês':                  'Fechamentos de Ops no Mês',

  // ── KING Carteira ─────────────────────────────────────────────────────────
  'Nº Total de Contas na Carteira': 'Nº Total de Contas na Carteira',
  'Contas Excellent':               'Contas Excellent',
  'Contas Good':                    'Contas Good',
  'Contas Poor':                    'Contas Poor',
  'Contas Bad':                     'Contas Bad',
  'MRR Total da Carteira (R$)':     'MRR Total da Carteira (R$)',
}

// Normaliza o texto de uma célula da coluna A para comparação:
// remove "↓ " ou "↓" no início, trim, e lowercase.
export function normalizarLabel(texto: string): string {
  return texto.replace(/^↓\s*/u, '').trim().toLowerCase()
}

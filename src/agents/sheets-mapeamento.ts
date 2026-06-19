// Mapa: rótulo da métrica no app → label exato na coluna A da planilha operacional.
// A normalização remove "  ↳ " no início (sub-itens da planilha) antes de comparar.
export const MAPEAMENTO_METRICAS: Record<string, string> = {
  // ── RETENÇÃO & CHURN (Planilha King) ─────────────────────────────────────
  'Nº Churns Registrados':               'Nº Churns Registrados',
  'RRM Churn Nominal (R$)':              'RRM Churn Nominal (R$)',
  'Life Time Médio dos Churns (meses)':  'Life Time Médio dos Churns (meses)',
  'LTV Médio Perdido por Churn (R$)':    'LTV Médio Perdido por Churn (R$)',
  'Churns pós 7º Pagamento — LTV (R$)': 'Churns pós 7º Pagamento — LTV (R$)',

  // ── CHURN via Tarefas ─────────────────────────────────────────────────────
  'Churns Resgatados':        'Churns Resgatados',
  'Inadimplentes Resgatados': 'Inadimplentes Resgatados',

  // ── ENGAJAMENTO & COBERTURA (Planilha Tarefas) ───────────────────────────
  // Sub-itens têm "  ↳ " na planilha — a normalização remove esse prefixo
  'Reunião de Implantação Elite':        '  ↳ Reunião de Implantação Elite',
  'Reunião de Kick-Off':                 '  ↳ Reunião de Kick-Off',
  'Reunião de Engajamento':              '  ↳ Reunião de Engajamento',
  'Reunião de Pipe de Risco':            '  ↳ Reunião de Pipe de Risco',
  'Reunião de IA & Automações':          '  ↳ Reunião de IA & Automações',
  'Diagnóstico Radar':                   '  ↳ Diagnóstico Radar',
  'Outras Reuniões de Cultivação':       '  ↳ Outras Reuniões de Cultivação',
  'Reuniões Remarcadas / Canceladas':    'Reuniões Remarcadas / Canceladas',
  'Revisões de Contas (Checklist s/ reunião)': 'Revisões de Contas (Checklist s/ reunião)',

  // ── OPORTUNIDADES & EXPANSÃO ──────────────────────────────────────────────
  // Atenção: a planilha usa plural "Oportunidades" (vs singular no app)
  'Upgrades de Plano':                              '  ↳ Upgrades de Plano',
  'Cross-Sell (Consultorias / BigBoss)':            '  ↳ Cross-Sell (Consultorias / BigBoss)',
  'Oportunidade de IA (Justine/Dona/Flowter)':      '  ↳ Oportunidades de IA (Justine/Dona/Flowter)',
  'Oportunidade de API (pagas)':                    '  ↳ Oportunidades de API (pagas)',
  'Eventos / Comunidade / Parceiros':               '  ↳ Eventos / Comunidade / Parceiros',
  'Fechamentos de Ops no Mês':                      'Fechamentos de Ops no Mês',

  // ── SAÚDE DA CARTEIRA (Planilha King Carteira) ───────────────────────────
  'Nº Total de Contas na Carteira': 'Nº Total de Contas na Carteira',
  'Contas Excellent':               'Contas Excellent',
  'Contas Good':                    'Contas Good',
  'Contas Poor':                    'Contas Poor',
  'Contas Bad':                     'Contas Bad',
  'MRR Total da Carteira (R$)':     'MRR Total da Carteira (R$)',
}

// Normaliza label da coluna A: remove prefixo "  ↳ " (ou variações), trim, lowercase.
export function normalizarLabel(texto: string): string {
  return texto.replace(/^\s*↳\s*/u, '').trim().toLowerCase()
}

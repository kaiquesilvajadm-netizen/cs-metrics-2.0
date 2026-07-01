export interface ColaboradorConfig {
  nomeDisplay: string   // nome exibido no dropdown (Nome + Primeiro Sobrenome)
  nomeCompleto: string  // nome completo como consta em COLABORADORES_AUTORIZADOS
  abaSheet: string      // nome exato da aba na planilha operacional
  senha: string         // senha da aba (pares compartilham a mesma senha)
}

export const COLABORADORES: ColaboradorConfig[] = [
  // ── Aba: Amanda ───────────────────────────────────────────────────────────
  { nomeDisplay: 'Amanda Pereira',   nomeCompleto: 'AMANDA GIULLIA PEREIRA DIAS DA MOTTA', abaSheet: 'Amanda',         senha: 'ADVBOX3101' },
  // ── Aba: Ana e Bruna ──────────────────────────────────────────────────────
  { nomeDisplay: 'Ana Iris Silva',   nomeCompleto: 'ANA IRIS DA SILVA RAMOS DE SOUZA',     abaSheet: 'Ana e Bruna',    senha: 'ADVBOX3202' },
  { nomeDisplay: 'Bruna Silva',      nomeCompleto: 'BRUNA DA SILVA',                        abaSheet: 'Ana e Bruna',    senha: 'ADVBOX3202' },
  // ── Aba: Ana Julia ────────────────────────────────────────────────────────
  { nomeDisplay: 'Ana Júlia Ramos',  nomeCompleto: 'ANA JÚLIA RAMOS REZENDE',              abaSheet: 'Ana Julia',      senha: 'ADVBOX3303' },
  // ── Aba: Dalmo ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Dalmo Hussid',     nomeCompleto: 'DALMO HUSSID FERREIRA',                abaSheet: 'Dalmo',          senha: 'ADVBOX3404' },
  // ── Aba: Julia ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Júlia Andalecio',  nomeCompleto: 'JÚLIA ANDALECIO LEMES',                abaSheet: 'Julia',          senha: 'ADVBOX3505' },
  // ── Aba: Laísa ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Laísa Nunes',      nomeCompleto: 'LAÍSA NUNES DA CUNHA',                 abaSheet: 'Laísa',          senha: 'ADVBOX3606' },
  // ── Aba: Luana ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Luana Siqueira',   nomeCompleto: 'LUANA SIQUEIRA DA SILVA',              abaSheet: 'Luana',    senha: 'ADVBOX3707' },
  // ── Aba: Tércio ───────────────────────────────────────────────────────────
  { nomeDisplay: 'Tércio Strutzel',  nomeCompleto: 'TERCIO STRUTZEL CORONADO',             abaSheet: 'Tércio ', senha: 'ADVBOX4411' },
  // ── Aba: Mari ─────────────────────────────────────────────────────────────
  { nomeDisplay: 'Mariana Nunes',    nomeCompleto: 'MARIANA NUNES DE SANTANA',             abaSheet: 'Mari',           senha: 'ADVBOX3808' },
  // ── Aba: Pedro e Paulo ────────────────────────────────────────────────────
  { nomeDisplay: 'Pedro Sella',      nomeCompleto: 'PEDRO AUGUSTO SANCHES SELLA',          abaSheet: 'Pedro e Paulo',  senha: 'ADVBOX3909' },
  { nomeDisplay: 'Paulo Oliveira',   nomeCompleto: 'PAULO VICTOR MOREIRA DE OLIVEIRA',     abaSheet: 'Pedro e Paulo',  senha: 'ADVBOX3909' },
  // ── Aba: Thais ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Thaís Amadeu',     nomeCompleto: 'THAÍS AMADEU PESSIM',                  abaSheet: 'Thais',          senha: 'ADVBOX3010' },
]

export function encontrarPorNomeDisplay(nomeDisplay: string): ColaboradorConfig | undefined {
  return COLABORADORES.find((c) => c.nomeDisplay === nomeDisplay)
}

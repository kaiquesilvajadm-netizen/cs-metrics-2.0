// Dados de colaboradores usados para popular seletores na interface (client
// e server). NÃO contém senha — a senha fica isolada em
// credenciais-colaboradores.ts (server-only), para nunca ir parar no bundle
// do navegador. Ver ModalExportar.tsx, que importa este arquivo no cliente.
export interface ColaboradorConfig {
  nomeDisplay: string   // nome exibido no dropdown (Nome + Primeiro Sobrenome)
  nomeCompleto: string  // nome completo como consta em COLABORADORES_AUTORIZADOS
  abaSheet: string      // nome exato da aba na planilha operacional
}

export const COLABORADORES: ColaboradorConfig[] = [
  // ── Aba: Amanda ───────────────────────────────────────────────────────────
  { nomeDisplay: 'Amanda Pereira',   nomeCompleto: 'AMANDA GIULLIA PEREIRA DIAS DA MOTTA', abaSheet: 'Amanda' },
  // ── Aba: Ana e Bruna ──────────────────────────────────────────────────────
  { nomeDisplay: 'Ana Iris Silva',   nomeCompleto: 'ANA IRIS DA SILVA RAMOS DE SOUZA',     abaSheet: 'Ana e Bruna' },
  { nomeDisplay: 'Bruna Silva',      nomeCompleto: 'BRUNA DA SILVA',                        abaSheet: 'Ana e Bruna' },
  // ── Aba: Ana Julia ────────────────────────────────────────────────────────
  { nomeDisplay: 'Ana Júlia Ramos',  nomeCompleto: 'ANA JÚLIA RAMOS REZENDE',              abaSheet: 'Ana Julia' },
  // ── Aba: Dalmo ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Dalmo Hussid',     nomeCompleto: 'DALMO HUSSID FERREIRA',                abaSheet: 'Dalmo' },
  // ── Aba: Julia ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Júlia Andalecio',  nomeCompleto: 'JÚLIA ANDALECIO LEMES',                abaSheet: 'Julia' },
  // ── Aba: Laísa ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Laísa Nunes',      nomeCompleto: 'LAÍSA NUNES DA CUNHA',                 abaSheet: 'Laísa' },
  // ── Aba: Luana ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Luana Siqueira',   nomeCompleto: 'LUANA SIQUEIRA DA SILVA',              abaSheet: 'Luana' },
  // ── Aba: Tércio ───────────────────────────────────────────────────────────
  { nomeDisplay: 'Tércio Strutzel',  nomeCompleto: 'TERCIO STRUTZEL CORONADO',             abaSheet: 'Tércio ' },
  // ── Aba: Mari ─────────────────────────────────────────────────────────────
  { nomeDisplay: 'Mariana Nunes',    nomeCompleto: 'MARIANA NUNES DE SANTANA',             abaSheet: 'Mari' },
  // ── Aba: Pedro ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Pedro Sella',      nomeCompleto: 'PEDRO AUGUSTO SANCHES SELLA',          abaSheet: 'Pedro ' },
  { nomeDisplay: 'Paulo Oliveira',   nomeCompleto: 'PAULO VICTOR MOREIRA DE OLIVEIRA',     abaSheet: 'Pedro ' },
  // ── Aba: Thais ────────────────────────────────────────────────────────────
  { nomeDisplay: 'Thaís Amadeu',     nomeCompleto: 'THAÍS AMADEU PESSIM',                  abaSheet: 'Thais' },
  // ── Aba: Luan ─────────────────────────────────────────────────────────────
  { nomeDisplay: 'Luan Marques',     nomeCompleto: 'LUAN MARQUES DE ANDRADE',              abaSheet: 'Luan' },
  // ── Aba: Talita ───────────────────────────────────────────────────────────
  { nomeDisplay: 'Talita Rodrigues', nomeCompleto: 'TALITA RODRIGUES VILELA',              abaSheet: 'Talita' },
  // ── Aba: Stephanie ────────────────────────────────────────────────────────
  { nomeDisplay: 'Stephanie Oliveira', nomeCompleto: 'STEPHANIE OLIVEIRA AFONSO',          abaSheet: 'Stephanie' },
  // ── Aba: Vanessa ──────────────────────────────────────────────────────────
  { nomeDisplay: 'Vanessa Nascimento', nomeCompleto: 'VANESSA DO NASCIMENTO LOURENÇO',     abaSheet: 'Vanessa' },
]

export function encontrarPorNomeDisplay(nomeDisplay: string): ColaboradorConfig | undefined {
  return COLABORADORES.find((c) => c.nomeDisplay === nomeDisplay)
}

// Algumas abas são compartilhadas por 2 pessoas (ex: "Ana e Bruna", "Pedro
// "). Usado pelo painel gerencial para rotular cada linha da tabela com
// todos os nomes que dividem aquela aba, em vez de mostrar o mesmo dado
// duas vezes como se fossem pessoas diferentes.
export function nomeDisplayDaAba(abaSheet: string): string {
  return COLABORADORES.filter((c) => c.abaSheet === abaSheet)
    .map((c) => c.nomeDisplay)
    .join(' & ')
}

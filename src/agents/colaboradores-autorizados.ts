// Lista de colaboradores cujos dados são exibidos no painel.
// A comparação ignora maiúsculas/minúsculas, espaços extras e prefixos
// entre parênteses como "(FÉRIAS)" que o sistema pode inserir no nome.
export const COLABORADORES_AUTORIZADOS = [
  'ANA JÚLIA RAMOS REZENDE',
  'AMANDA GIULLIA PEREIRA DIAS DA MOTTA',
  'DALMO HUSSID FERREIRA',
  'ANA IRIS DA SILVA RAMOS DE SOUZA',
  'JÚLIA ANDALECIO LEMES',
  'LAÍSA NUNES DA CUNHA',
  'BRUNA DA SILVA',
  'LUANA SIQUEIRA DA SILVA',
  'MARIANA NUNES DE SANTANA',
  'PEDRO AUGUSTO SANCHES SELLA',
  'PAULO VICTOR MOREIRA DE OLIVEIRA',
  'TERCIO STRUTZEL CORONADO',
  'THAÍS AMADEU PESSIM',
] as const

// Remove prefixos como "(FÉRIAS) " do nome — usado tanto na comparação
// quanto na normalização para exibição no dashboard.
export function normalizarNomeColaborador(nome: string): string {
  return nome.replace(/^\([^)]+\)\s*/u, '').trim()
}

function nomeBase(nome: string): string {
  return normalizarNomeColaborador(nome).toLowerCase()
}

const autorizadosNormalizados = COLABORADORES_AUTORIZADOS.map((n) => n.toLowerCase())

export function colaboradorAutorizado(nomeNaPlanilha: string): boolean {
  const base = nomeBase(nomeNaPlanilha)
  return autorizadosNormalizados.some((a) => a === base)
}

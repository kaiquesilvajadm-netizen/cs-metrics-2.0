// Mapa mês (1-12) → letra da coluna na planilha operacional.
// Ajuste as letras conforme o cabeçalho real da sua planilha.
// Padrão assumido: A=Nome, B=Frequência, C=Janeiro … N=Dezembro, O=Total
export const MESES_COLUNAS: Record<number, string> = {
  1:  'C',  // Janeiro
  2:  'D',  // Fevereiro
  3:  'E',  // Março
  4:  'F',  // Abril
  5:  'G',  // Maio
  6:  'H',  // Junho
  7:  'I',  // Julho
  8:  'J',  // Agosto
  9:  'K',  // Setembro
  10: 'L',  // Outubro
  11: 'M',  // Novembro
  12: 'N',  // Dezembro
}

export const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

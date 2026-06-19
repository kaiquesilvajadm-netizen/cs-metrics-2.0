// Mapa mês (1-12) → letra da coluna na planilha operacional.
// Confirmado lendo a linha 4 da aba Amanda:
// A=MÉTRICA, B=FREQ., C=JAN, D=FEV, E=MAR, F=ABR, G=MAI, H=JUN,
// I=JUL, J=AGO, K=SET, L=OUT, M=NOV, N=DEZ, O=TOTAL/MÉD
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

import type { LinhaPlanilha } from '@/types/metricas'

// Nomes de coluna que identificam o colaborador em cada planilha — são
// diferentes em cada uma (confirmado lendo arquivos reais: a Planilha de
// Tarefas não tem coluna "Colaborador (I.S.)", quem identifica quem
// executou cada tarefa é "Remetente").
export const COLUNA_COLABORADOR_TAREFAS = 'remetente'
export const COLUNA_COLABORADOR_KING = 'colaborador (i.s.)'

export function normalizarTexto(texto: string): string {
  // Colapsa espaços duplos (a planilha real tem casos como
  // "CSC PLANO DE AÇÃO  - ADOÇÃO" com dois espaços) para não quebrar a
  // comparação exata de strings.
  return texto.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function valorDaColuna(linha: LinhaPlanilha, nomeColunaNormalizado: string): unknown {
  for (const [coluna, valor] of Object.entries(linha)) {
    if (normalizarTexto(coluna) === nomeColunaNormalizado) return valor
  }
  return null
}

export function agruparPorColuna(linhas: LinhaPlanilha[], nomeColunaNormalizado: string): Map<string, LinhaPlanilha[]> {
  const grupos = new Map<string, LinhaPlanilha[]>()

  for (const linha of linhas) {
    const valor = valorDaColuna(linha, nomeColunaNormalizado)
    const chave = valor === null || valor === undefined || String(valor).trim() === '' ? 'Não identificado' : String(valor).trim()
    const grupo = grupos.get(chave) ?? []
    grupo.push(linha)
    grupos.set(chave, grupo)
  }

  return grupos
}

// Extrai um número de uma célula que pode já estar tipada (number) ou vir
// como texto com formatação brasileira (ex: "R$ 16.983,00" -> 16983,
// "37 meses" -> 37). Em pt-BR o ponto é separador de milhar e a vírgula é
// o separador decimal — importante não confundir os dois.
export function extrairNumeroDaColuna(linha: LinhaPlanilha, nomeColunaNormalizado: string): number | null {
  const valor = valorDaColuna(linha, nomeColunaNormalizado)
  if (valor === null || valor === undefined) return null
  if (typeof valor === 'number') return valor

  const textoLimpo = String(valor).replace(/[^\d,.-]/g, '')
  if (textoLimpo === '') return null

  const numeroNormalizado = textoLimpo.includes(',')
    ? textoLimpo.replace(/\./g, '').replace(',', '.')
    : textoLimpo

  const numero = Number(numeroNormalizado)
  return Number.isNaN(numero) ? null : numero
}

export function somar(numeros: number[]): number {
  return numeros.reduce((total, numero) => total + numero, 0)
}

export function media(numeros: number[]): number {
  return numeros.length === 0 ? 0 : somar(numeros) / numeros.length
}

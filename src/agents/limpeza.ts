import type { LinhaPlanilha } from '@/types/metricas'
import { normalizarTexto } from './util-linhas'

// Agente de Limpeza
// As planilhas reais exportadas pelo ADVBOX costumam ter lixo (texto de
// menu da página, linha de "Total", paginação) antes ou depois da tabela de
// verdade, e a tabela nem sempre começa na primeira linha. Este agente:
// 1. Procura a linha de cabeçalho de verdade, pela presença de uma
//    coluna-âncora conhecida (ex: "Compromisso" ou "ID da conta").
// 2. Descarta linhas que não parecem dados reais (poucas células
//    preenchidas — típico de linhas de total/paginação coladas da página).
export function limparTabela(matriz: unknown[][], colunaAncora: string): LinhaPlanilha[] {
  const colunaAncoraNormalizada = normalizarTexto(colunaAncora)

  const indiceCabecalho = matriz.findIndex((linha) =>
    linha.some((celula) => normalizarTexto(String(celula ?? '')) === colunaAncoraNormalizada)
  )

  if (indiceCabecalho === -1) {
    throw new Error(
      `Não encontramos a coluna "${colunaAncora}" nesta planilha. Confirme se o arquivo é o esperado para esta aba.`
    )
  }

  const cabecalho = matriz[indiceCabecalho]
  const nomesVistos = new Map<string, number>()
  const colunas = cabecalho.map((celula, indice) => {
    const nome = String(celula ?? '').trim() || `coluna_${indice + 1}`
    const contagem = nomesVistos.get(nome) ?? 0
    nomesVistos.set(nome, contagem + 1)
    return contagem === 0 ? nome : `${nome}_${contagem + 1}`
  })

  return matriz
    .slice(indiceCabecalho + 1)
    .filter((linha) => celulasPreenchidas(linha) >= colunas.length / 2)
    .map((linha) => paraObjeto(colunas, linha))
}

function celulasPreenchidas(linha: unknown[]): number {
  return linha.filter((valor) => valor !== null && valor !== undefined && String(valor).trim() !== '').length
}

function paraObjeto(colunas: string[], linha: unknown[]): LinhaPlanilha {
  const objeto: LinhaPlanilha = {}
  colunas.forEach((coluna, indice) => {
    objeto[coluna] = linha[indice] ?? null
  })
  return objeto
}

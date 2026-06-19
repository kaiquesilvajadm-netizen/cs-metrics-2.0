import * as XLSX from 'xlsx'

export interface AbaBruta {
  nomeAba: string
  matriz: unknown[][]
}

// Agente de Importação
// Lê o arquivo de planilha (.xlsx, .xls ou .csv) enviado pelo usuário e
// devolve cada aba como uma matriz bruta (linha x coluna), sem nenhuma
// suposição sobre onde fica o cabeçalho — planilhas reais exportadas pelo
// ADVBOX vêm com lixo (texto de menu, totais, paginação) antes/depois da
// tabela de verdade. Quem decide onde está o cabeçalho é o agente de
// limpeza (limparTabela), procurando uma coluna-âncora conhecida.
export async function importarPlanilha(arquivo: File): Promise<AbaBruta[]> {
  const bytes = new Uint8Array(await arquivo.arrayBuffer())
  const workbook = XLSX.read(bytes, { type: 'array' })

  return workbook.SheetNames.map((nomeAba) => ({
    nomeAba,
    matriz: XLSX.utils.sheet_to_json(workbook.Sheets[nomeAba], {
      header: 1,
      defval: null,
    }) as unknown[][],
  }))
}

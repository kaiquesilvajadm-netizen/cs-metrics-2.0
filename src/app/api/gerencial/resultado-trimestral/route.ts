import { NextResponse, type NextRequest } from 'next/server'
import { requisicaoAutenticada } from '@/agents/gerencial/sessao'
import { abasUnicas } from '@/agents/gerencial/leitura-abas'
import { lerMesesFechados, lerMetasPeriodo } from '@/agents/gerencial/planilha-gerencial'
import { agregarPeriodo } from '@/agents/gerencial/agregador-trimestral'

const PERIODOS: Record<string, number[]> = {
  Q1: [1, 2, 3],
  Q2: [4, 5, 6],
  Q3: [7, 8, 9],
  Q4: [10, 11, 12],
  ano: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}

export async function GET(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const periodo = searchParams.get('periodo') ?? 'ano'
  const ano = Number(searchParams.get('ano') ?? new Date().getFullYear())

  const meses = PERIODOS[periodo]
  if (!meses) {
    return NextResponse.json({ erro: `Período inválido: ${periodo}. Use Q1, Q2, Q3, Q4 ou ano.` }, { status: 400 })
  }

  try {
    const dadosPorAbaEMes = await lerMesesFechados(meses, ano)

    // "Fechado" aqui = todas as 15 abas presentes pra aquele mês, mesma
    // regra de mesEstaFechado — um mês com só algumas abas gravadas não
    // conta como fechado, evita tratar dado incompleto como oficial.
    const totalAbas = abasUnicas().length
    const contagemPorMes = new Map<number, number>()
    for (const porMes of dadosPorAbaEMes.values()) {
      for (const mes of porMes.keys()) {
        contagemPorMes.set(mes, (contagemPorMes.get(mes) ?? 0) + 1)
      }
    }
    const mesesFechados = meses.filter((mes) => (contagemPorMes.get(mes) ?? 0) >= totalAbas)

    const metasPeriodo = await lerMetasPeriodo(mesesFechados.length > 0 ? mesesFechados : meses)
    const resultado = agregarPeriodo(meses, ano, mesesFechados, dadosPorAbaEMes, metasPeriodo)
    return NextResponse.json(resultado)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/resultado-trimestral]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

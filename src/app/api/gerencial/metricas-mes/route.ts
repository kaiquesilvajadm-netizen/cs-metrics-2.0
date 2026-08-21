import { NextResponse, type NextRequest } from 'next/server'
import { requisicaoAutenticada } from '@/agents/gerencial/sessao'
import { obterDadosDoMes } from '@/agents/gerencial/resolver-mes'

export async function GET(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const agora = new Date()
  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes') ?? agora.getMonth() + 1)
  const ano = Number(searchParams.get('ano') ?? agora.getFullYear())

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ erro: 'Mês inválido.' }, { status: 400 })
  }

  try {
    const { oficial, aviso, porAba } = await obterDadosDoMes(mes, ano)
    return NextResponse.json({ mes, ano, oficial, aviso, porAba: Object.fromEntries(porAba) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/metricas-mes]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

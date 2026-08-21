import { NextResponse, type NextRequest } from 'next/server'
import { requisicaoAutenticada } from '@/agents/gerencial/sessao'
import { obterDadosDoMes } from '@/agents/gerencial/resolver-mes'
import { agregarTime } from '@/agents/gerencial/agregador-time'
import { lerMetas } from '@/agents/gerencial/planilha-gerencial'

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
    const [{ oficial, aviso, porAba }, metas] = await Promise.all([obterDadosDoMes(mes, ano), lerMetas(mes)])
    const resultado = agregarTime(mes, ano, porAba, metas)
    return NextResponse.json({ oficial, aviso, ...resultado })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/resultado-mensal]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

import { NextResponse, type NextRequest } from 'next/server'
import { requisicaoAutenticada } from '@/agents/gerencial/sessao'
import { lerMetas, salvarMetas } from '@/agents/gerencial/planilha-gerencial'
import { METAS_CONFIG } from '@/config/metas-gerencial'

export async function GET(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const agora = new Date()
  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes') ?? agora.getMonth() + 1)

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ erro: 'Mês inválido.' }, { status: 400 })
  }

  try {
    const metas = await lerMetas(mes)
    const configurado = METAS_CONFIG.some((def) => metas[def.chave] !== null)
    return NextResponse.json({ mes, configurado, metas })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/metas GET]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { mes, metas } = (await request.json()) as { mes: number; metas: Record<string, number> }

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ erro: 'Mês inválido.' }, { status: 400 })
  }
  if (!metas || typeof metas !== 'object') {
    return NextResponse.json({ erro: 'Metas inválidas.' }, { status: 400 })
  }

  try {
    await salvarMetas(mes, metas)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/metas POST]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

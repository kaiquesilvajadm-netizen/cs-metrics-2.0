import { NextResponse, type NextRequest } from 'next/server'
import { requisicaoAutenticada } from '@/agents/gerencial/sessao'
import { lerMetasNivel, salvarMetasNivel, type IdentificadorNivel, type Trimestre } from '@/agents/gerencial/planilha-gerencial'
import { METAS_CONFIG } from '@/config/metas-gerencial'
import type { NivelMeta } from '@/types/gerencial'

const TRIMESTRES: Trimestre[] = ['Q1', 'Q2', 'Q3', 'Q4']

function lerNivelEIdentificador(searchParams: URLSearchParams): { nivel: NivelMeta; identificador: IdentificadorNivel } | null {
  const nivel = (searchParams.get('nivel') ?? 'mes') as NivelMeta

  if (nivel === 'mes') {
    const mes = Number(searchParams.get('mes') ?? new Date().getMonth() + 1)
    if (!Number.isInteger(mes) || mes < 1 || mes > 12) return null
    return { nivel, identificador: mes }
  }

  if (nivel === 'trimestre') {
    const trimestre = searchParams.get('trimestre') as Trimestre | null
    if (!trimestre || !TRIMESTRES.includes(trimestre)) return null
    return { nivel, identificador: trimestre }
  }

  if (nivel === 'ano') {
    return { nivel, identificador: 'ano' }
  }

  return null
}

export async function GET(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const resolvido = lerNivelEIdentificador(new URL(request.url).searchParams)
  if (!resolvido) {
    return NextResponse.json({ erro: 'Nível/identificador de meta inválido.' }, { status: 400 })
  }

  try {
    const metas = await lerMetasNivel(resolvido.nivel, resolvido.identificador)
    const configurado = METAS_CONFIG.some((def) => metas[def.chave] !== null)
    return NextResponse.json({ ...resolvido, configurado, metas })
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

  const body = (await request.json()) as { nivel: NivelMeta; mes?: number; trimestre?: Trimestre; metas: Record<string, number> }
  const { nivel, mes, trimestre, metas } = body

  let identificador: IdentificadorNivel
  if (nivel === 'mes') {
    if (!mes || !Number.isInteger(mes) || mes < 1 || mes > 12) {
      return NextResponse.json({ erro: 'Mês inválido.' }, { status: 400 })
    }
    identificador = mes
  } else if (nivel === 'trimestre') {
    if (!trimestre || !TRIMESTRES.includes(trimestre)) {
      return NextResponse.json({ erro: 'Trimestre inválido.' }, { status: 400 })
    }
    identificador = trimestre
  } else if (nivel === 'ano') {
    identificador = 'ano'
  } else {
    return NextResponse.json({ erro: 'Nível de meta inválido.' }, { status: 400 })
  }

  if (!metas || typeof metas !== 'object') {
    return NextResponse.json({ erro: 'Metas inválidas.' }, { status: 400 })
  }

  try {
    await salvarMetasNivel(nivel, identificador, metas)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/metas POST]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

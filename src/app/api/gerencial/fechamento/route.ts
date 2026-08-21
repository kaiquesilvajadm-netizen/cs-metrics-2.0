import { NextResponse, type NextRequest } from 'next/server'
import { requisicaoAutenticada } from '@/agents/gerencial/sessao'
import { lerMetricasDasAbas } from '@/agents/gerencial/leitura-abas'
import { mesEstaFechado, fecharMes } from '@/agents/gerencial/planilha-gerencial'
import type { MetricasColaboradorMes } from '@/types/gerencial'

export async function GET(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const mes = Number(searchParams.get('mes'))
  const ano = Number(searchParams.get('ano'))

  if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano)) {
    return NextResponse.json({ erro: 'Mês/ano inválidos.' }, { status: 400 })
  }

  try {
    const fechado = await mesEstaFechado(mes, ano)
    return NextResponse.json({ mes, ano, fechado })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/fechamento GET]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

// Fecha o mês: lê ao vivo da planilha operacional e grava (sobrescrevendo
// se já existir) na planilha gerencial. Fechar de novo um mês já fechado
// substitui os valores — mesma filosofia de "última ação vale" do resto do
// app, permite corrigir um fechamento feito com dado errado.
export async function POST(request: NextRequest) {
  if (!requisicaoAutenticada(request)) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
  }

  const { mes, ano } = (await request.json()) as { mes: number; ano: number }

  if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(ano)) {
    return NextResponse.json({ erro: 'Mês/ano inválidos.' }, { status: 400 })
  }

  try {
    const dadosPorAbaEMes = await lerMetricasDasAbas([mes], ano)
    const dadosPorAba = new Map<string, MetricasColaboradorMes>()
    for (const [aba, porMes] of dadosPorAbaEMes) {
      const m = porMes.get(mes)
      if (m) dadosPorAba.set(aba, m)
    }

    await fecharMes(mes, ano, dadosPorAba)
    return NextResponse.json({ ok: true, abasFechadas: dadosPorAba.size })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[gerencial/fechamento POST]', msg)
    return NextResponse.json({ erro: msg }, { status: 500 })
  }
}

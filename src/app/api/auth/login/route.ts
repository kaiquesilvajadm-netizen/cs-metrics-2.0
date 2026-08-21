import { NextResponse } from 'next/server'
import { encontrarPorNomeDisplay } from '@/config/colaboradores'
import { senhaValidaPara } from '@/config/credenciais-colaboradores'

export async function POST(request: Request) {
  const { nome, senha } = await request.json()

  const colaborador = encontrarPorNomeDisplay(nome)
  if (!colaborador || !senhaValidaPara(colaborador.abaSheet, senha)) {
    return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

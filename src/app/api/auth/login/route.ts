import { NextResponse } from 'next/server'
import { encontrarPorNomeDisplay } from '@/config/colaboradores'

export async function POST(request: Request) {
  const { nome, senha } = await request.json()

  const colaborador = encontrarPorNomeDisplay(nome)
  if (!colaborador || colaborador.senha !== senha) {
    return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

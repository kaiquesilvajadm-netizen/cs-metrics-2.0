import { NextResponse } from 'next/server'
import { COLABORADORES } from '@/config/colaboradores'

export async function POST(request: Request) {
  const { nome, senha } = await request.json()

  const senhaCorreta = process.env.SENHA_APP
  if (!senhaCorreta) {
    return NextResponse.json({ erro: 'Configuração ausente' }, { status: 500 })
  }

  const colaboradorExiste = COLABORADORES.some((c) => c.nomeExibicao === nome)
  if (!colaboradorExiste || senha !== senhaCorreta) {
    return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

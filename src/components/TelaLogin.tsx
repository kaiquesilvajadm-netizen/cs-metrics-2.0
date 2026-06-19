'use client'

import { useState } from 'react'
import { COLABORADORES } from '@/config/colaboradores'
import { useAuth } from '@/contexts/AuthContext'

export default function TelaLogin() {
  const { login } = useAuth()
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome) { setErro('Selecione seu nome.'); return }
    if (!senha) { setErro('Digite a senha.'); return }

    setCarregando(true)
    setErro(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha }),
    })

    setCarregando(false)

    if (!res.ok) {
      setErro('Senha incorreta.')
      return
    }

    const colaborador = COLABORADORES.find((c) => c.nomeExibicao === nome)!
    login({ nomeExibicao: colaborador.nomeExibicao, nomeCompleto: colaborador.nomeCompleto, abaSheet: colaborador.abaSheet })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-blue-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl">
            📊
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Painel de Métricas</h1>
          <p className="mt-1 text-xs text-slate-500">ADVBOX · Cultivação</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Seu nome
            </label>
            <select
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErro(null) }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {COLABORADORES.map((c) => (
                <option key={c.nomeExibicao} value={c.nomeExibicao}>
                  {c.nomeExibicao}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(null) }}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

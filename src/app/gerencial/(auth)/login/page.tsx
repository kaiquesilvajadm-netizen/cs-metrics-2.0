'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginGerencialPage() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault()
    setCarregando(true)
    setErro('')

    const res = await fetch('/api/gerencial/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })

    if (!res.ok) {
      const data = await res.json()
      setErro(data.erro ?? 'Senha incorreta.')
      setCarregando(false)
      return
    }

    router.push('/gerencial/metricas-mes')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-blue-50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Painel Gerencial</h1>
        <p className="mt-1 text-sm text-slate-500">ADVBOX · Cultivação</p>

        <form onSubmit={entrar} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

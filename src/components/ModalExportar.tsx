'use client'

import { useState } from 'react'
import { COLABORADORES } from '@/config/colaboradores'
import { NOMES_MESES } from '@/config/meses-colunas'
import type { LinhaDashboard } from '@/agents/relatorio'

interface Props {
  linhasDashboard: LinhaDashboard[]
  onFechar: () => void
}

type Estado = 'idle' | 'enviando' | 'ok' | 'erro'

const mesAtual = new Date().getMonth() + 1 // 1-12

export default function ModalExportar({ linhasDashboard, onFechar }: Props) {
  const [nomeDisplay, setNomeDisplay] = useState('')
  const [senha, setSenha] = useState('')
  const [mes, setMes] = useState(mesAtual)
  const [estado, setEstado] = useState<Estado>('idle')
  const [detalhe, setDetalhe] = useState('')

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!nomeDisplay) { setDetalhe('Selecione seu nome.'); setEstado('erro'); return }
    if (!senha)       { setDetalhe('Digite a senha.');    setEstado('erro'); return }

    setEstado('enviando')
    setDetalhe('')

    const res = await fetch('/api/sheets/escrever', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeDisplay, senha, mes, linhasDashboard }),
    })

    const data = await res.json()

    if (!res.ok) {
      setEstado('erro')
      setDetalhe(data.erro ?? 'Falha ao enviar.')
    } else {
      setEstado('ok')
      setDetalhe(`${data.atualizadas} célula${data.atualizadas !== 1 ? 's' : ''} atualizada${data.atualizadas !== 1 ? 's' : ''} na aba "${data.aba}".`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {estado === 'ok' ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✅
            </div>
            <p className="text-sm font-medium text-slate-800">{detalhe}</p>
            <button
              type="button"
              onClick={onFechar}
              className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Exportar para Planilha</h2>
              <button
                type="button"
                onClick={onFechar}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviar} className="flex flex-col gap-4">
              {/* Nome */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Seu nome</label>
                <select
                  value={nomeDisplay}
                  onChange={(e) => { setNomeDisplay(e.target.value); setEstado('idle'); setDetalhe('') }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {COLABORADORES.map((c) => (
                    <option key={c.nomeDisplay} value={c.nomeDisplay}>
                      {c.nomeDisplay}
                    </option>
                  ))}
                </select>
              </div>

              {/* Senha */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setEstado('idle'); setDetalhe('') }}
                  placeholder="ADVBOX****"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Mês */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Mês de referência</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {NOMES_MESES.map((nome, i) => (
                    <option key={i + 1} value={i + 1}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>

              {estado === 'erro' && detalhe && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{detalhe}</p>
              )}

              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {estado === 'enviando' ? 'Enviando...' : '📤 Confirmar Exportação'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

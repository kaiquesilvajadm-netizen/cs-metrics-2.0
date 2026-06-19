'use client'

import { useState } from 'react'
import type { LinhaDashboard } from '@/agents/relatorio'

interface Props {
  aba: string
  linhasDashboard: LinhaDashboard[]
  disabled?: boolean
}

type Estado = 'idle' | 'enviando' | 'ok' | 'erro'

export default function BotaoExportar({ aba, linhasDashboard, disabled }: Props) {
  const [estado, setEstado] = useState<Estado>('idle')
  const [detalhe, setDetalhe] = useState('')

  async function handleExportar() {
    setEstado('enviando')
    setDetalhe('')
    try {
      const res = await fetch('/api/sheets/escrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aba, linhasDashboard }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEstado('erro')
        setDetalhe(data.erro ?? 'Falha ao enviar')
      } else {
        setEstado('ok')
        setDetalhe(`${data.atualizadas} célula${data.atualizadas !== 1 ? 's' : ''} atualizada${data.atualizadas !== 1 ? 's' : ''}`)
      }
    } catch {
      setEstado('erro')
      setDetalhe('Erro de conexão')
    }
  }

  const label = {
    idle: '📤 Enviar para Planilha',
    enviando: 'Enviando...',
    ok: `✅ Enviado — ${detalhe}`,
    erro: `❌ Erro — ${detalhe}`,
  }[estado]

  const cor = {
    idle: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    enviando: 'bg-slate-400 text-white cursor-not-allowed',
    ok: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
    erro: 'bg-red-100 text-red-800 ring-1 ring-red-300',
  }[estado]

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleExportar}
        disabled={disabled || estado === 'enviando'}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${cor} disabled:opacity-50`}
      >
        {label}
      </button>
      {estado === 'ok' && (
        <button
          type="button"
          onClick={() => { setEstado('idle'); setDetalhe('') }}
          className="text-xs text-slate-400 hover:text-slate-600 text-right"
        >
          Enviar novamente
        </button>
      )}
    </div>
  )
}

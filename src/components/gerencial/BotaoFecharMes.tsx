'use client'

import { useState } from 'react'

interface Props {
  mes: number
  ano: number
  onFechado?: () => void
}

export default function BotaoFecharMes({ mes, ano, onFechado }: Props) {
  const [estado, setEstado] = useState<'idle' | 'confirmando' | 'salvando' | 'ok' | 'erro'>('idle')
  const [detalhe, setDetalhe] = useState('')

  async function confirmar() {
    setEstado('salvando')
    try {
      const res = await fetch('/api/gerencial/fechamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, ano }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao fechar o mês.')
      setEstado('ok')
      setDetalhe(`${data.abasFechadas} aba(s) gravada(s) com sucesso.`)
      onFechado?.()
    } catch (err) {
      setEstado('erro')
      setDetalhe(err instanceof Error ? err.message : 'Erro desconhecido.')
    }
  }

  if (estado === 'ok') {
    return <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">✅ Mês fechado. {detalhe}</p>
  }

  if (estado === 'confirmando' || estado === 'salvando') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
        <p className="text-xs text-amber-800">
          Isso vai gravar os números atuais como o resultado <strong>definitivo</strong> deste mês, sobrescrevendo qualquer
          fechamento anterior. Confirma?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEstado('idle')}
            disabled={estado === 'salvando'}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={estado === 'salvando'}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {estado === 'salvando' ? 'Salvando...' : 'Sim, salvar definitivamente'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setEstado('confirmando')}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
      >
        💾 Salvar Definitivamente
      </button>
      {estado === 'erro' && <p className="text-xs text-red-600">{detalhe}</p>}
    </div>
  )
}

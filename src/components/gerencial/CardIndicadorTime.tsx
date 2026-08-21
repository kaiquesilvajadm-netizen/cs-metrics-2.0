'use client'

import { useState } from 'react'
import type { IndicadorTime } from '@/types/gerencial'

const CORES_STATUS: Record<string, string> = {
  ok: 'bg-emerald-100 text-emerald-700',
  atencao: 'bg-amber-100 text-amber-700',
  critico: 'bg-red-100 text-red-700',
  sem_meta: 'bg-slate-100 text-slate-500',
}

const ROTULOS_STATUS: Record<string, string> = {
  ok: 'Na meta',
  atencao: 'Atenção',
  critico: 'Crítico',
  sem_meta: 'Sem meta',
}

function formatarValor(rotulo: string, valor: number | null): string {
  if (valor === null) return '—'
  if (rotulo.includes('(%)')) return `${valor.toFixed(1)}%`
  return valor.toLocaleString('pt-BR')
}

interface Props extends IndicadorTime {
  explicacao?: string
  notaPeriodo?: string
}

export default function CardIndicadorTime({
  chave,
  rotulo,
  realizado,
  meta,
  percentualAtingimento,
  status,
  explicacao,
  notaPeriodo,
}: Props) {
  const [tooltipAberto, setTooltipAberto] = useState(false)
  const temInfo = !!explicacao

  return (
    <div className="relative min-w-0">
      {tooltipAberto && <div className="fixed inset-0 z-10" onClick={() => setTooltipAberto(false)} aria-hidden />}

      <div className="h-full rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium uppercase leading-tight tracking-wide text-slate-500">{rotulo}</span>
          <div className="flex flex-shrink-0 items-center gap-1">
            {temInfo && (
              <button
                type="button"
                onClick={() => setTooltipAberto((v) => !v)}
                className="relative z-20 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 hover:bg-blue-100 hover:text-blue-700"
                aria-label="Como esse número foi calculado"
              >
                ?
              </button>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CORES_STATUS[status]}`}>
              {ROTULOS_STATUS[status]}
            </span>
          </div>
        </div>

        <div className="mt-2 text-2xl font-bold text-slate-900">{formatarValor(rotulo, realizado)}</div>

        {meta !== null && (
          <div className="mt-2">
            <p className="text-xs text-slate-400">
              Meta: <span className="font-medium text-slate-600">{formatarValor(rotulo, meta)}</span>
              {percentualAtingimento !== null && ` · ${percentualAtingimento.toFixed(1)}%`}
            </p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${status === 'ok' ? 'bg-emerald-500' : status === 'atencao' ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, Math.max(0, percentualAtingimento ?? 0))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {tooltipAberto && temInfo && (
        <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Como foi calculado</span>
            <button
              type="button"
              onClick={() => setTooltipAberto(false)}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">{explicacao}</p>
          {notaPeriodo && <p className="mt-2 text-xs leading-relaxed text-slate-500">{notaPeriodo}</p>}
        </div>
      )}
    </div>
  )
}

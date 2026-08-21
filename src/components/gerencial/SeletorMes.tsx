'use client'

import { NOMES_MESES } from '@/config/meses-colunas'

interface Props {
  mes: number
  onMudarMes: (mes: number) => void
}

export default function SeletorMes({ mes, onMudarMes }: Props) {
  return (
    <select
      value={mes}
      onChange={(e) => onMudarMes(Number(e.target.value))}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
    >
      {NOMES_MESES.map((nome, i) => (
        <option key={i + 1} value={i + 1}>
          {nome}
        </option>
      ))}
    </select>
  )
}

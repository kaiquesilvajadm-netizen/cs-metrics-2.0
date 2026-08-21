'use client'

export const PERIODOS = [
  { valor: 'Q1', label: 'Q1 (Jan-Mar)' },
  { valor: 'Q2', label: 'Q2 (Abr-Jun)' },
  { valor: 'Q3', label: 'Q3 (Jul-Set)' },
  { valor: 'Q4', label: 'Q4 (Out-Dez)' },
  { valor: 'ano', label: 'Ano completo' },
] as const

interface Props {
  periodo: string
  onMudarPeriodo: (periodo: string) => void
}

export default function SeletorPeriodo({ periodo, onMudarPeriodo }: Props) {
  return (
    <select
      value={periodo}
      onChange={(e) => onMudarPeriodo(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
    >
      {PERIODOS.map((p) => (
        <option key={p.valor} value={p.valor}>
          {p.label}
        </option>
      ))}
    </select>
  )
}

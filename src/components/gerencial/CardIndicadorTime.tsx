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

export default function CardIndicadorTime({ chave, rotulo, realizado, meta, percentualAtingimento, status }: IndicadorTime) {
  return (
    <div key={chave} className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase leading-tight tracking-wide text-slate-500">{rotulo}</span>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${CORES_STATUS[status]}`}>
          {ROTULOS_STATUS[status]}
        </span>
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
  )
}

'use client'

import { nomeDisplayDaAba } from '@/config/colaboradores'
import { INDICADORES_TIME } from '@/config/metas-gerencial'
import type { MetricasColaboradorMes } from '@/types/gerencial'

interface Props {
  porAba: Record<string, MetricasColaboradorMes | null>
}

function formatarValor(rotulo: string, valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—'
  if (rotulo.includes('(%)')) return `${valor.toFixed(1)}%`
  return valor.toLocaleString('pt-BR')
}

// Uma linha por aba ÚNICA (não por pessoa) — abas compartilhadas como "Ana
// e Bruna" aparecem como uma linha só, rotulada com os dois nomes, em vez
// de duplicar o mesmo dado como se fossem colaboradores diferentes.
export default function TabelaMetricasMes({ porAba }: Props) {
  const abas = Object.keys(porAba).sort((a, b) => nomeDisplayDaAba(a).localeCompare(nomeDisplayDaAba(b), 'pt-BR'))

  if (abas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Nenhum dado ainda. Clique em Atualizar.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
              Colaborador
            </th>
            {INDICADORES_TIME.map((def) => (
              <th
                key={def.chave}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
              >
                {def.icone} {def.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {abas.map((aba) => {
            const m = porAba[aba]
            return (
              <tr key={aba}>
                <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-4 py-3 text-sm font-medium text-slate-800">
                  {nomeDisplayDaAba(aba)}
                </td>
                {INDICADORES_TIME.map((def) => (
                  <td key={def.chave} className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatarValor(def.rotulo, m?.[def.chave])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

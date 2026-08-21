'use client'

import type { IndicadorTime } from '@/types/gerencial'

interface Props {
  indicadores: IndicadorTime[]
}

// Paleta validada (dataviz skill: validate_palette.js, modo light — todos os
// checks passaram). Segue a mesma semântica de Health Score já usada no
// resto do app (Excellent=verde, Good=azul, Poor=âmbar, Bad=vermelho);
// Churns ganha uma cor própria (violeta) por não fazer parte da mesma escala.
const COR_EXCELLENT = '#10b981'
const COR_GOOD = '#3b82f6'
const COR_POOR = '#f59e0b'
const COR_BAD = '#ef4444'
const COR_CHURN = '#8b5cf6'

function valorDe(indicadores: IndicadorTime[], chave: string): number | null {
  return indicadores.find((i) => i.chave === chave)?.realizado ?? null
}

function CirculoProgresso({ percentual, cor, rotulo, valorExibido }: { percentual: number; cor: string; rotulo: string; valorExibido: string }) {
  const raio = 54
  const circunferencia = 2 * Math.PI * raio
  const preenchido = Math.min(100, Math.max(0, percentual))
  const offset = circunferencia * (1 - preenchido / 100)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={raio} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={raio}
            fill="none"
            stroke={cor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-900">{valorExibido}</span>
        </div>
      </div>
      <span className="text-center text-xs font-medium uppercase tracking-wide text-slate-500">{rotulo}</span>
    </div>
  )
}

function BarraComparativa({ rotulo, valor, percentual, cor }: { rotulo: string; valor: number | null; percentual: number | null; cor: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 flex-shrink-0 text-xs text-slate-600">{rotulo}</span>
      <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${percentual === null ? 0 : Math.min(100, percentual)}%`, backgroundColor: cor }}
        />
      </div>
      <span className="w-32 flex-shrink-0 text-right text-xs font-medium text-slate-700">
        {valor === null ? '—' : `${valor.toLocaleString('pt-BR')} (${percentual!.toFixed(1)}%)`}
      </span>
    </div>
  )
}

// Dashboard visual do Menu 4 (Resultado Trimestral): Cobertura de Base como
// anel de progresso, e Contas Excellent/Good/Poor/Bad + Churns como barras
// mostrando o quanto cada uma representa da Meta — Total de Contas na
// ADVBOX (não do realizado — é a meta configurada no Menu 2).
export default function DashboardVisualTrimestral({ indicadores }: Props) {
  const coberturaBase = valorDe(indicadores, 'coberturaBasePercentual')
  const metaTotalAdvbox = indicadores.find((i) => i.chave === 'totalContasCarteira')?.meta ?? null

  const itens = [
    { rotulo: 'Contas Excellent', valor: valorDe(indicadores, 'contasExcellent'), cor: COR_EXCELLENT },
    { rotulo: 'Contas Good', valor: valorDe(indicadores, 'contasGood'), cor: COR_GOOD },
    { rotulo: 'Contas Poor', valor: valorDe(indicadores, 'contasPoor'), cor: COR_POOR },
    { rotulo: 'Contas Bad', valor: valorDe(indicadores, 'contasBad'), cor: COR_BAD },
    { rotulo: 'Nº Churns Registrados', valor: valorDe(indicadores, 'churnsRegistrados'), cor: COR_CHURN },
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">📊 Visão Gráfica do Período</h3>

      <div className="mt-5 flex flex-wrap items-center gap-8">
        <CirculoProgresso
          percentual={coberturaBase ?? 0}
          cor="#0ea5e9"
          rotulo="Cobertura de Base"
          valorExibido={coberturaBase === null ? '—' : `${coberturaBase.toFixed(1)}%`}
        />

        <div className="min-w-[280px] flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">Saúde da Carteira vs. Total de Contas na ADVBOX</h4>
          </div>
          {metaTotalAdvbox === null || metaTotalAdvbox === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
              Configure a &quot;Meta — Total de Contas na ADVBOX&quot; no menu Métricas Esperadas pra ver este comparativo.
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-400">
                Cada barra mostra quanto aquele número representa da meta de {metaTotalAdvbox.toLocaleString('pt-BR')} contas.
              </p>
              <div className="flex flex-col gap-3">
                {itens.map((item) => (
                  <BarraComparativa
                    key={item.rotulo}
                    rotulo={item.rotulo}
                    valor={item.valor}
                    percentual={item.valor === null ? null : (item.valor / metaTotalAdvbox) * 100}
                    cor={item.cor}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

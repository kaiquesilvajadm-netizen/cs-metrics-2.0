'use client'

import { useEffect, useState } from 'react'
import { METAS_CONFIG } from '@/config/metas-gerencial'
import { NOMES_MESES } from '@/config/meses-colunas'
import { limparCache } from '@/agents/gerencial/cache-local'
import type { NivelMeta } from '@/types/gerencial'

const TRIMESTRES = ['Q1', 'Q2', 'Q3', 'Q4'] as const

function queryDoNivel(nivel: NivelMeta, mes: number, trimestre: string): string {
  if (nivel === 'mes') return `nivel=mes&mes=${mes}`
  if (nivel === 'trimestre') return `nivel=trimestre&trimestre=${trimestre}`
  return 'nivel=ano'
}

export default function FormularioMetas() {
  const [nivel, setNivelInterno] = useState<NivelMeta>('mes')
  const [mes, setMesInterno] = useState(new Date().getMonth() + 1)
  const [trimestre, setTrimestreInterno] = useState<(typeof TRIMESTRES)[number]>('Q1')
  const [valores, setValores] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  // true assim que o usuário digita algo — impede trocar de aba/mês/trimestre
  // sem avisar, pra não apagar em silêncio o que ele já preencheu.
  const [sujo, setSujo] = useState(false)

  useEffect(() => {
    setCarregando(true)
    setMensagem('')
    fetch(`/api/gerencial/metas?${queryDoNivel(nivel, mes, trimestre)}`)
      .then((r) => r.json())
      .then((data) => {
        const novos: Record<string, string> = {}
        for (const def of METAS_CONFIG) {
          const v = data.metas?.[def.chave]
          novos[def.chave] = v === null || v === undefined ? '' : String(v)
        }
        setValores(novos)
        setSujo(false)
      })
      .finally(() => setCarregando(false))
  }, [nivel, mes, trimestre])

  function confirmarTroca(): boolean {
    if (!sujo) return true
    return window.confirm('Você preencheu campos aqui e ainda não salvou. Trocar agora vai descartar o que foi digitado. Trocar mesmo assim?')
  }

  function mudarNivel(novoNivel: NivelMeta) {
    if (novoNivel === nivel) return
    if (!confirmarTroca()) return
    setNivelInterno(novoNivel)
  }

  function mudarMes(novoMes: number) {
    if (novoMes === mes) return
    if (!confirmarTroca()) return
    setMesInterno(novoMes)
  }

  function mudarTrimestre(novoTrimestre: (typeof TRIMESTRES)[number]) {
    if (novoTrimestre === trimestre) return
    if (!confirmarTroca()) return
    setTrimestreInterno(novoTrimestre)
  }

  function mudarValor(chave: string, valor: string) {
    setSujo(true)
    setValores((prev) => ({ ...prev, [chave]: valor }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setMensagem('')

    const metas: Record<string, number> = {}
    for (const def of METAS_CONFIG) {
      const bruto = valores[def.chave]?.trim()
      if (!bruto) continue
      const numero = Number(bruto.replace(',', '.'))
      if (!Number.isNaN(numero)) metas[def.chave] = numero
    }

    try {
      const res = await fetch('/api/gerencial/metas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nivel, mes, trimestre, metas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao salvar.')
      setMensagem('✅ Metas salvas. Clique em Atualizar em Resultado Mensal/Trimestral pra ver os novos valores lá.')
      setSujo(false)
      // Resultado Mensal/Trimestral têm cache local pra não perder dado ao
      // trocar de menu — mas isso também guarda a meta antiga. Derruba os
      // dois pra forçar um Atualizar novo e não mostrar meta desatualizada.
      limparCache('resultado-mensal')
      limparCache('resultado-trimestral')
    } catch (err) {
      setMensagem(err instanceof Error ? `❌ ${err.message}` : '❌ Erro desconhecido.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">🎯 Métricas Esperadas</h2>

      <div className="mt-3 flex flex-wrap items-center gap-3 pb-4">
        <div className="flex gap-1 rounded-full bg-slate-100 p-1">
          {(['mes', 'trimestre', 'ano'] as NivelMeta[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => mudarNivel(n)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                nivel === n ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {n === 'mes' ? 'Mês' : n === 'trimestre' ? 'Trimestre' : 'Ano'}
            </button>
          ))}
        </div>

        {nivel === 'mes' && (
          <select
            value={mes}
            onChange={(e) => mudarMes(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
          >
            {NOMES_MESES.map((nome, i) => (
              <option key={i + 1} value={i + 1}>
                {nome}
              </option>
            ))}
          </select>
        )}

        {nivel === 'trimestre' && (
          <select
            value={trimestre}
            onChange={(e) => mudarTrimestre(e.target.value as (typeof TRIMESTRES)[number])}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="Q1">Q1 (Jan-Mar)</option>
            <option value="Q2">Q2 (Abr-Jun)</option>
            <option value="Q3">Q3 (Jul-Set)</option>
            <option value="Q4">Q4 (Out-Dez)</option>
          </select>
        )}

        {sujo && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            ● Alterações não salvas
          </span>
        )}
      </div>

      <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
        {nivel === 'mes' &&
          'Meta específica pra este mês. Se um mês não tiver meta própria, o sistema usa a do trimestre ou do ano, nessa ordem.'}
        {nivel === 'trimestre' &&
          'Meta pro trimestre inteiro — vale pros 3 meses e pro Resultado Trimestral, a menos que um mês específico tenha a sua própria.'}
        {nivel === 'ano' && 'Meta pro ano inteiro — usada quando não existe meta de mês nem de trimestre pra aquele período.'}
      </p>

      {carregando ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : (
        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {METAS_CONFIG.map((def) => (
              <div key={def.chave}>
                <label className="mb-1 block text-xs font-medium text-slate-700">{def.rotulo}</label>
                <input
                  value={valores[def.chave] ?? ''}
                  onChange={(e) => mudarValor(def.chave, e.target.value)}
                  placeholder={def.unidade === 'percentual' ? 'Ex: 10 (para 10%)' : 'Ex: 950'}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {mensagem && <p className="text-sm">{mensagem}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="mt-2 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar Metas'}
          </button>
        </form>
      )}
    </div>
  )
}

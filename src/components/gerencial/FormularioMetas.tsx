'use client'

import { useEffect, useState } from 'react'
import { METAS_CONFIG } from '@/config/metas-gerencial'
import SeletorMes from '@/components/gerencial/SeletorMes'

export default function FormularioMetas() {
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    setCarregando(true)
    setMensagem('')
    fetch(`/api/gerencial/metas?mes=${mes}`)
      .then((r) => r.json())
      .then((data) => {
        const novos: Record<string, string> = {}
        for (const def of METAS_CONFIG) {
          const v = data.metas?.[def.chave]
          novos[def.chave] = v === null || v === undefined ? '' : String(v)
        }
        setValores(novos)
      })
      .finally(() => setCarregando(false))
  }, [mes])

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
        body: JSON.stringify({ mes, metas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro ?? 'Falha ao salvar.')
      setMensagem('✅ Metas salvas com sucesso.')
    } catch (err) {
      setMensagem(err instanceof Error ? `❌ ${err.message}` : '❌ Erro desconhecido.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Métricas Esperadas</h2>
        <SeletorMes mes={mes} onMudarMes={setMes} />
      </div>

      {carregando ? (
        <p className="text-sm text-slate-400">Carregando...</p>
      ) : (
        <form onSubmit={salvar} className="flex flex-col gap-4">
          {METAS_CONFIG.map((def) => (
            <div key={def.chave}>
              <label className="mb-1 block text-xs font-medium text-slate-700">{def.rotulo}</label>
              <input
                value={valores[def.chave] ?? ''}
                onChange={(e) => setValores((prev) => ({ ...prev, [def.chave]: e.target.value }))}
                placeholder={def.unidade === 'percentual' ? 'Ex: 10 (para 10%)' : 'Ex: 950'}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}

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

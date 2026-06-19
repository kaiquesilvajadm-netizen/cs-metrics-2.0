'use client'

import { useState } from 'react'

interface Props {
  nomes: string[]
  onSelecionar: (nome: string) => void
}

export default function ModalSelecionarColaborador({ nomes, onSelecionar }: Props) {
  const [busca, setBusca] = useState('')

  const nomesFiltrados = nomes.filter((nome) =>
    nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Selecionar colaborador</h2>
        <p className="mt-1 text-sm text-slate-500">
          Escolha o colaborador cujos dados serão exibidos. Somente os dados dessa pessoa serão mostrados.
        </p>

        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar pelo nome…"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <ul className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200">
          {nomesFiltrados.map((nome) => (
            <li key={nome}>
              <button
                type="button"
                onClick={() => onSelecionar(nome)}
                className="w-full px-4 py-3 text-left text-sm font-medium text-black transition-colors hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
              >
                {nome}
              </button>
            </li>
          ))}
          {nomesFiltrados.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-400">Nenhum resultado encontrado.</li>
          )}
        </ul>

        <p className="mt-3 text-center text-xs text-slate-400">
          {nomes.length} colaborador{nomes.length !== 1 ? 'es' : ''} encontrado{nomes.length !== 1 ? 's' : ''} na planilha
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import ModalExportar from '@/components/ModalExportar'
import type { LinhaDashboard } from '@/agents/relatorio'

interface Props {
  linhasDashboard: LinhaDashboard[]
  disabled?: boolean
}

export default function BotaoExportar({ linhasDashboard, disabled }: Props) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        disabled={disabled || linhasDashboard.length === 0}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        📤 Exportar Dados
      </button>

      {modalAberto && (
        <ModalExportar
          linhasDashboard={linhasDashboard}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </>
  )
}

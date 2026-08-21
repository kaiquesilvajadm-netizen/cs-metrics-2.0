'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NOMES_MESES } from '@/config/meses-colunas'

function mesAnterior(): { mes: number; ano: number } {
  const agora = new Date()
  const mesAtual = agora.getMonth() + 1 // 1-indexed
  return mesAtual === 1 ? { mes: 12, ano: agora.getFullYear() - 1 } : { mes: mesAtual - 1, ano: agora.getFullYear() }
}

// Checagem leve (só a aba "Fechamentos Mensais" da planilha gerencial, não
// a operacional inteira) feita automaticamente ao carregar qualquer tela do
// painel — é o que viabiliza o aviso insistente até o líder fechar o mês.
// Não conta como "sincronizar métricas": isso continua manual, só no botão
// Atualizar de cada menu.
export default function BannerFechamentoPendente() {
  const [pendente, setPendente] = useState(false)
  const [carregado, setCarregado] = useState(false)
  const { mes, ano } = mesAnterior()

  useEffect(() => {
    fetch(`/api/gerencial/fechamento?mes=${mes}&ano=${ano}`)
      .then((r) => r.json())
      .then((data) => setPendente(!data.fechado))
      .catch(() => {})
      .finally(() => setCarregado(true))
  }, [mes, ano])

  if (!carregado || !pendente) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span>
        ⚠️ <strong>
          {NOMES_MESES[mes - 1]}/{ano}
        </strong>{' '}
        ainda não foi fechado. Revise e salve definitivamente as métricas do mês.
      </span>
      <Link
        href="/gerencial/resultado-mensal"
        className="flex-shrink-0 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
      >
        Revisar agora
      </Link>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const MENUS = [
  { href: '/gerencial/metricas-mes', label: 'Métricas do Mês', icone: '📊' },
  { href: '/gerencial/metas', label: 'Métricas Esperadas', icone: '🎯' },
  { href: '/gerencial/resultado-mensal', label: 'Resultado Mensal do Time', icone: '📈' },
  { href: '/gerencial/resultado-trimestral', label: 'Resultado Trimestral do Time', icone: '🗓️' },
] as const

export default function SidebarGerencial() {
  const pathname = usePathname()
  const router = useRouter()

  async function sair() {
    await fetch('/api/gerencial/logout', { method: 'POST' })
    router.push('/gerencial/login')
    router.refresh()
  }

  return (
    <aside className="print:hidden flex w-64 flex-shrink-0 flex-col gap-1 rounded-2xl bg-slate-900 p-4">
      <div className="mb-4 px-2">
        <span className="text-sm font-bold text-white">ADVBOX</span>
        <p className="text-xs text-slate-400">Painel Gerencial</p>
      </div>

      {MENUS.map((menu) => {
        const ativo = pathname?.startsWith(menu.href)
        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              ativo ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-2">{menu.icone}</span>
            {menu.label}
          </Link>
        )
      })}

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={sair}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}

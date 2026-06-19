'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { SessaoUsuario } from '@/types/auth'

interface AuthContextValue {
  sessao: SessaoUsuario | null
  login: (sessao: SessaoUsuario) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'cs-metrics-sessao'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY)
      if (salvo) setSessao(JSON.parse(salvo))
    } catch {
      // ignora
    }
    setCarregando(false)
  }, [])

  function login(s: SessaoUsuario) {
    setSessao(s)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  }

  function logout() {
    setSessao(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  if (carregando) return null

  return (
    <AuthContext.Provider value={{ sessao, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

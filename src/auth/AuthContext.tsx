import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthError, createAuthProvider, type User } from './providers'

type AuthState = {
  user: User | null
  loading: boolean
  mode: 'local' | 'supabase'
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string, newPassword?: string) => Promise<string>
}

const Ctx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const provider = useMemo(createAuthProvider, [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    provider
      .getSession()
      .then((u) => active && setUser(u))
      .finally(() => active && setLoading(false))
    return () => {
      active = false // verhindert setState nach dem Unmount
    }
  }, [provider])

  const signIn = useCallback(
    async (email: string, password: string) => setUser(await provider.signIn(email, password)),
    [provider],
  )
  const signUp = useCallback(
    async (name: string, email: string, password: string) =>
      setUser(await provider.signUp(name, email, password)),
    [provider],
  )
  const signOut = useCallback(async () => {
    await provider.signOut()
    setUser(null)
  }, [provider])
  const resetPassword = useCallback(
    (email: string, newPassword?: string) => provider.resetPassword(email, newPassword),
    [provider],
  )

  const value = useMemo(
    () => ({ user, loading, mode: provider.mode, signIn, signUp, signOut, resetPassword }),
    [user, loading, provider.mode, signIn, signUp, signOut, resetPassword],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth muss innerhalb von <AuthProvider> verwendet werden')
  return ctx
}

/** Fehlermeldungen für die Oberfläche — technische Details bleiben draußen. */
export function authMessage(err: unknown): string {
  if (err instanceof AuthError) return err.message
  if (err instanceof TypeError) return 'Keine Verbindung zum Server. Bist du online?'
  return 'Das hat nicht geklappt. Bitte versuch es noch einmal.'
}

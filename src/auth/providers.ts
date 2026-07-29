/**
 * Auth-Adapter mit zwei austauschbaren Implementierungen hinter einer Schnittstelle.
 *
 * - Ohne konfigurierte Supabase-Variablen laufen Konten lokal im Browser. Die App ist damit
 *   sofort und ohne Backend benutzbar — passend zum Offline-First-Versprechen.
 * - Sind `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` gesetzt, übernimmt Supabase.
 *   Bewusst direkt gegen die REST-Auth-API statt über @supabase/supabase-js: die vier
 *   benötigten Endpunkte sind je drei Zeilen, das spart eine 100-kB-Abhängigkeit.
 */

export type User = { id: string; email: string; name: string }

export interface AuthProvider {
  readonly mode: 'local' | 'supabase'
  getSession(): Promise<User | null>
  signIn(email: string, password: string): Promise<User>
  signUp(name: string, email: string, password: string): Promise<User>
  signOut(): Promise<void>
  /** Gibt die Meldung zurück, die der Oberfläche angezeigt werden soll. */
  resetPassword(email: string, newPassword?: string): Promise<string>
}

export class AuthError extends Error {}

const norm = (email: string) => email.trim().toLowerCase()

async function hash(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* ------------------------------ Lokale Konten ------------------------------ */

type StoredUser = User & { salt: string; hash: string }

const USERS_KEY = 'habitgrid.users'
const SESSION_KEY = 'habitgrid.session'

function readUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

const writeUsers = (users: Record<string, StoredUser>) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

/**
 * ponytail: Konten liegen im localStorage und sind keine Sicherheitsgrenze — wer Zugriff
 * auf das Gerät hat, hat Zugriff auf die Daten. Das Passwort wird trotzdem gesalzen
 * gehasht, damit ein an anderer Stelle wiederverwendetes Passwort nicht im Klartext
 * herumliegt. Für echte Mehrgerätekonten die Supabase-Variante konfigurieren.
 */
export class LocalAuthProvider implements AuthProvider {
  readonly mode = 'local' as const

  async getSession(): Promise<User | null> {
    const id = localStorage.getItem(SESSION_KEY)
    if (!id) return null
    const user = Object.values(readUsers()).find((u) => u.id === id)
    return user ? { id: user.id, email: user.email, name: user.name } : null
  }

  async signUp(name: string, email: string, password: string): Promise<User> {
    const key = norm(email)
    if (!key.includes('@')) throw new AuthError('Bitte gib eine gültige E-Mail-Adresse ein.')
    if (password.length < 8) throw new AuthError('Das Passwort braucht mindestens 8 Zeichen.')
    const users = readUsers()
    if (users[key]) throw new AuthError('Für diese Adresse gibt es hier bereits ein Konto.')

    const salt = crypto.randomUUID()
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: key,
      name: name.trim() || key.split('@')[0],
      salt,
      hash: await hash(password, salt),
    }
    users[key] = user
    writeUsers(users)
    localStorage.setItem(SESSION_KEY, user.id)
    return { id: user.id, email: user.email, name: user.name }
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = readUsers()[norm(email)]
    // Bewusst dieselbe Meldung für unbekanntes Konto und falsches Passwort
    if (!user || (await hash(password, user.salt)) !== user.hash) {
      throw new AuthError('E-Mail-Adresse oder Passwort stimmt nicht.')
    }
    localStorage.setItem(SESSION_KEY, user.id)
    return { id: user.id, email: user.email, name: user.name }
  }

  async signOut() {
    localStorage.removeItem(SESSION_KEY)
  }

  async resetPassword(email: string, newPassword?: string): Promise<string> {
    const users = readUsers()
    const user = users[norm(email)]
    if (!user) throw new AuthError('Für diese Adresse gibt es hier kein Konto.')
    if (!newPassword) {
      return 'Dieses Konto liegt nur in diesem Browser. Vergib unten direkt ein neues Passwort.'
    }
    if (newPassword.length < 8) throw new AuthError('Das Passwort braucht mindestens 8 Zeichen.')
    user.salt = crypto.randomUUID()
    user.hash = await hash(newPassword, user.salt)
    writeUsers(users)
    return 'Passwort geändert. Du kannst dich jetzt anmelden.'
  }
}

/* -------------------------------- Supabase --------------------------------- */

const TOKEN_KEY = 'habitgrid.supabase.token'

export class SupabaseAuthProvider implements AuthProvider {
  readonly mode = 'supabase' as const

  constructor(
    private url: string,
    private anonKey: string,
  ) {}

  private async call(path: string, init: RequestInit = {}) {
    const res = await fetch(`${this.url}/auth/v1${path}`, {
      ...init,
      headers: {
        apikey: this.anonKey,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new AuthError(body.error_description || body.msg || body.message || 'Anmeldung fehlgeschlagen.')
    }
    return body
  }

  private store(body: { access_token?: string; refresh_token?: string }) {
    if (body.access_token) localStorage.setItem(TOKEN_KEY, JSON.stringify(body))
  }

  private toUser(u: { id: string; email: string; user_metadata?: { name?: string } }): User {
    return { id: u.id, email: u.email, name: u.user_metadata?.name || u.email.split('@')[0] }
  }

  async getSession(): Promise<User | null> {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    try {
      const { access_token } = JSON.parse(raw)
      const user = await this.call('/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      return this.toUser(user)
    } catch {
      localStorage.removeItem(TOKEN_KEY) // abgelaufenes Token nicht endlos mitschleppen
      return null
    }
  }

  async signUp(name: string, email: string, password: string): Promise<User> {
    const body = await this.call('/signup', {
      method: 'POST',
      body: JSON.stringify({ email: norm(email), password, data: { name } }),
    })
    this.store(body)
    if (!body.user) throw new AuthError('Bitte bestätige zuerst die E-Mail, die wir dir geschickt haben.')
    return this.toUser(body.user)
  }

  async signIn(email: string, password: string): Promise<User> {
    const body = await this.call('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: norm(email), password }),
    })
    this.store(body)
    return this.toUser(body.user)
  }

  async signOut() {
    const raw = localStorage.getItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    if (!raw) return
    try {
      const { access_token } = JSON.parse(raw)
      await this.call('/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${access_token}` },
      })
    } catch {
      // Abmelden darf nie an einem Serverfehler scheitern — lokal ist die Sitzung bereits weg
    }
  }

  async resetPassword(email: string): Promise<string> {
    await this.call('/recover', { method: 'POST', body: JSON.stringify({ email: norm(email) }) })
    return 'Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen geschickt.'
  }
}

export function createAuthProvider(): AuthProvider {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return url && key ? new SupabaseAuthProvider(url, key) : new LocalAuthProvider()
}

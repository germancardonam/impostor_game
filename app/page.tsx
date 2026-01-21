'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, LogIn, Users, Shield, BookOpen, Key } from 'lucide-react'

export default function Home() {
  const [view, setView] = useState<'initial' | 'create' | 'join'>('initial')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Create Room State
  const [players, setPlayers] = useState(4)
  const [impostors, setImpostors] = useState(1)
  const [theme, setTheme] = useState('casa')
  const [token, setToken] = useState('')

  // Join Room State
  const [joinToken, setJoinToken] = useState('')

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players, impostors, theme, token }),
      })
      if (res.ok) {
        router.push(`/room/${token}`)
      } else {
        alert('Error al crear la sala. Quizás el token ya existe.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/room/check?token=${joinToken}`)
      if (res.ok) {
        router.push(`/room/${joinToken}`)
      } else {
        alert('Sala no encontrada o token inválido.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 text-white">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white/10 shadow-2xl backdrop-blur-xl border border-white/20">
        <div className="p-8">
          <h1 className="mb-2 text-center text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            IMPOSTOR
          </h1>
          <p className="mb-8 text-center text-zinc-300">Descubre quién miente entre vosotros</p>

          {view === 'initial' && (
            <div className="space-y-4">
              <button
                onClick={() => setView('create')}
                className="group flex w-full items-center justify-between rounded-2xl bg-indigo-600 px-6 py-4 font-bold transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-6 w-6" />
                  <span>Crear Room</span>
                </div>
                <Users className="h-5 w-5 opacity-50 group-hover:opacity-100" />
              </button>

              <button
                onClick={() => setView('join')}
                className="group flex w-full items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-6 py-4 font-bold transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="h-6 w-6" />
                  <span>Entrar a un Room</span>
                </div>
                <Key className="h-5 w-5 opacity-50 group-hover:opacity-100" />
              </button>
            </div>
          )}

          {view === 'create' && (
            <form onSubmit={handleCreateRoom} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Users className="h-4 w-4" /> Jugadores totales
                </label>
                <input
                  type="number"
                  min={3}
                  max={50}
                  value={isNaN(players) ? '' : players}
                  onChange={(e) => setPlayers(parseInt(e.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Shield className="h-4 w-4" /> Cantidad de impostores
                </label>
                <input
                  type="number"
                  min={1}
                  max={isNaN(players) ? 1 : Math.floor(players / 2)}
                  value={isNaN(impostors) ? '' : impostors}
                  onChange={(e) => setImpostors(parseInt(e.target.value))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <BookOpen className="h-4 w-4" /> Temática
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="casa">Cosas de la casa</option>
                  <option value="comidas">Comidas</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Key className="h-4 w-4" /> TOKEN de la sala
                </label>
                <input
                  type="text"
                  placeholder="Ej: SALA123"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-widest uppercase"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('initial')}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 font-semibold transition-all hover:bg-white/10"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] rounded-xl bg-indigo-600 py-3 font-bold transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Sala'}
                </button>
              </div>
            </form>
          )}

          {view === 'join' && (
            <form onSubmit={handleJoinRoom} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                  <Key className="h-4 w-4" /> Introduce el TOKEN
                </label>
                <input
                  type="text"
                  placeholder="SALA123"
                  value={joinToken}
                  onChange={(e) => setJoinToken(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-8 text-center text-3xl font-black outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-[0.5em] uppercase"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setView('initial')}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 py-3 font-semibold transition-all hover:bg-white/10"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] rounded-xl bg-indigo-600 py-3 font-bold transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

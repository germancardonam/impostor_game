'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, LogIn, Users, Shield, BookOpen, Key, Sparkles, ChevronLeft, Fingerprint } from 'lucide-react'

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
    <div className="flex min-h-svh flex-col items-center justify-between bg-dark text-primary selection:bg-accent selection:text-white p-6 overflow-x-hidden">
      {/* Background patterns/effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-sm relative z-10">
        <header className="mb-12 text-center w-full animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mobile Edition</span>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-secondary to-accent leading-none mb-4 drop-shadow-2xl">
            IMPOSTOR
          </h1>
          <p className="text-primary/50 font-bold text-sm tracking-wide">Descubre al impostor</p>
        </header>

        <div className="w-full space-y-4">
          {view === 'initial' && (
            <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-500">
              <button
                onClick={() => setView('create')}
                className="group flex items-center justify-between rounded-[2rem] bg-secondary p-1 whitespace-nowrap overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-secondary/20"
              >
                <div className="flex items-center gap-4 pl-6 py-5">
                  <Users className="h-6 w-6 text-white/50 group-hover:text-white transition-colors" />
                  <span className="text-2xl font-black text-white">Crear Room</span>
                </div>
                <div className="bg-white/20 p-5 rounded-[1.8rem] ml-4 transition-transform group-hover:translate-x-1">
                  <PlusCircle className="h-8 w-8 text-white" />
                </div>
              </button>

              <button
                onClick={() => setView('join')}
                className="group flex items-center justify-between rounded-[2rem] bg-white/5 border border-white/10 p-1 whitespace-nowrap overflow-hidden transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-4 pl-6 py-5">
                  <Key className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors" />
                  <span className="text-2xl font-black text-primary">Entrar</span>
                </div>
                <div className="bg-white/5 p-5 rounded-[1.8rem] ml-4">
                  <LogIn className="h-8 w-8 text-primary/60" />
                </div>
              </button>
            </div>
          )}

          {view === 'create' && (
            <form onSubmit={handleCreateRoom} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full mb-8">
              <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-8">
                  <button onClick={() => setView('initial')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-primary/40">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-black uppercase tracking-tight">Configuración</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-1 flex items-center gap-2">
                      <Users className="w-3 h-3 text-secondary" /> Jugadores
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={50}
                      value={isNaN(players) ? '' : players}
                      onChange={(e) => setPlayers(parseInt(e.target.value))}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 outline-none focus:border-secondary transition-all font-black text-2xl text-center"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-1 flex items-center gap-2">
                      <Shield className="w-3 h-3 text-secondary" /> Impostores
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={isNaN(players) ? 1 : Math.floor(players / 2)}
                      value={isNaN(impostors) ? '' : impostors}
                      onChange={(e) => setImpostors(parseInt(e.target.value))}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 outline-none focus:border-secondary transition-all font-black text-2xl text-center"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-1 flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-secondary" /> Temática
                  </label>
                  <div className="relative">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-5 outline-none focus:border-secondary transition-all appearance-none font-black text-xl"
                    >
                      <option value="casa" className="bg-dark">Cosas de la casa</option>
                      <option value="comidas" className="bg-dark">Comidas</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                      <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-primary rotate-45 mb-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-1 flex items-center gap-2">
                    <Key className="w-3 h-3 text-secondary" /> TOKEN de Acceso
                  </label>
                  <input
                    type="text"
                    placeholder="SALA123"
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    required
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-6 py-5 outline-none focus:border-secondary transition-all font-mono font-black tracking-[0.3em] uppercase text-2xl text-center placeholder:text-primary/5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[1.8rem] bg-secondary py-6 font-black text-xl shadow-xl shadow-secondary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Crear Sala</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {view === 'join' && (
            <form onSubmit={handleJoinRoom} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full mb-8">
              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
                <button type="button" onClick={() => setView('initial')} className="absolute left-6 top-6 p-2 rounded-full hover:bg-white/10 text-primary/40">
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="inline-flex p-6 rounded-[2.5rem] bg-accent/10 border border-accent/20 mb-8 mt-4">
                  <Key className="h-12 w-12 text-accent" />
                </div>

                <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Acceso</h3>
                <p className="text-primary/40 text-sm font-bold tracking-widest uppercase mb-10">Ingresa el código secreto</p>

                <input
                  type="text"
                  placeholder="CODE"
                  value={joinToken}
                  onChange={(e) => setJoinToken(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded-[2rem] bg-white/10 border border-white/20 px-4 py-8 text-center text-5xl font-black outline-none focus:border-accent transition-all font-mono tracking-[0.4em] uppercase mb-10 placeholder:text-primary/5 shadow-inner"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[2rem] bg-accent py-6 font-black text-2xl shadow-xl shadow-accent/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'Entrar Ahora'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="w-full py-8 text-center opacity-30 mt-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-8 bg-primary/20" />
          <Fingerprint className="w-4 h-4" />
          <div className="h-px w-8 bg-primary/20" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2026 Impostor HQ</p>
      </footer>

      {/* Touch optimization script/metadata could go here if needed */}
      <style jsx global>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        select {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

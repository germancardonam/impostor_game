'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users, Shield, BookOpen, Key, Loader2, ArrowRight, RotateCcw, Sparkles, User, Fingerprint, ChevronLeft } from 'lucide-react'
import { THEMES, ThemeKey } from '@/lib/constants'

export default function RoomPage() {
    const { token } = useParams()
    const router = useRouter()

    const [playerId, setPlayerId] = useState<string>('')
    const [playerName, setPlayerName] = useState<string>('')
    const [isRegistered, setIsRegistered] = useState(false)
    const [room, setRoom] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Initialize player ID
    useEffect(() => {
        let id = localStorage.getItem('impostor_player_id')
        if (!id) {
            id = Math.random().toString(36).substring(2, 9)
            localStorage.setItem('impostor_player_id', id)
        }
        setPlayerId(id)

        const savedName = localStorage.getItem('impostor_player_name')
        if (savedName) setPlayerName(savedName)
    }, [])

    // Poll room status
    useEffect(() => {
        if (!token) return

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/room/status?token=${token}`)
                if (res.ok) {
                    const data = await res.json()
                    setRoom(data)

                    // Check if user is already in players list
                    const me = data.players.find((p: any) => p.id === localStorage.getItem('impostor_player_id'))
                    if (me) {
                        setIsRegistered(true)
                        setPlayerName(me.name)
                    }
                } else {
                    setError('Sala no encontrada')
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 3000)
        return () => clearInterval(interval)
    }, [token])

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!playerName.trim()) return

        setLoading(true)
        try {
            const res = await fetch('/api/room/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name: playerName, playerId }),
            })
            if (res.ok) {
                localStorage.setItem('impostor_player_name', playerName)
                setIsRegistered(true)
            } else {
                const d = await res.json()
                alert(d.error || 'Error al entrar')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = async () => {
        setLoading(true)
        try {
            await fetch('/api/room/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading && !room) {
        return (
            <div className="flex min-h-svh items-center justify-center bg-dark text-primary">
                <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-secondary" />
                    <div className="absolute inset-0 blur-2xl bg-secondary/20 animate-pulse" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center bg-dark text-primary p-10 text-center">
                <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
                    <Shield className="w-12 h-12 text-secondary" />
                </div>
                <h1 className="text-4xl font-black mb-6 tracking-tight uppercase leading-tight">{error}</h1>
                <button
                    onClick={() => router.push('/')}
                    className="w-full max-w-xs rounded-[2rem] bg-secondary py-6 font-black text-xl shadow-2xl shadow-secondary/30 active:scale-95 transition-all"
                >
                    Volver al inicio
                </button>
            </div>
        )
    }

    // View: Registration
    if (!isRegistered) {
        return (
            <div className="flex min-h-svh items-center justify-center bg-dark p-6 text-primary">
                <div className="relative w-full max-w-sm overflow-hidden rounded-[3rem] bg-muted/20 p-10 shadow-2xl backdrop-blur-3xl border border-white/5 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-6 rounded-[2.5rem] bg-secondary/10 border border-secondary/20 mb-8 mt-2">
                            <User className="w-12 h-12 text-secondary" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mb-3 uppercase italic">Identidad</h2>
                        <p className="text-primary/40 font-bold tracking-wide">¿Cómo te conocerán?</p>
                    </div>
                    <form onSubmit={handleJoin} className="space-y-8">
                        <div className="relative">
                            <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-primary/10" />
                            <input
                                type="text"
                                placeholder="Tu apodo"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                required
                                maxLength={15}
                                className="w-full rounded-[1.8rem] bg-white/5 border border-white/10 pl-16 pr-8 py-7 text-3xl font-black outline-none focus:border-secondary transition-all placeholder:text-primary/5 shadow-inner"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-[1.8rem] bg-secondary py-7 font-black text-2xl shadow-2xl shadow-secondary/30 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                        >
                            <span>Unirse</span>
                            <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    const me = room?.players.find((p: any) => p.id === playerId)
    const isAdmin = room?.players[0]?.id === playerId // First player is admin

    // View: Playing
    if (room?.status === 'playing') {
        return (
            <div className="flex min-h-svh flex-col items-center bg-dark p-6 text-primary overflow-x-hidden pb-32 selection:bg-secondary selection:text-white">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[100%] h-[50%] bg-accent/10 blur-[150px] rounded-full" />
                </div>

                <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <header className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-secondary/20 border border-secondary/30 px-4 py-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">En Vivo</span>
                            </div>
                            <span className="text-xs font-mono text-primary/20 tracking-widest bg-white/5 px-2 py-1 rounded-lg">#{token}</span>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleReset}
                                className="p-4 bg-white/5 rounded-2xl border border-white/10 text-primary/40 active:scale-90 transition-all"
                            >
                                <RotateCcw className="h-6 w-6" />
                            </button>
                        )}
                    </header>

                    <div className="mb-10 rounded-[3.5rem] bg-gradient-to-br from-muted/40 to-muted/20 p-12 text-center border border-white/10 relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent" />

                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 mb-8">Información Secreta</p>

                        {me?.role === 'impostor' ? (
                            <div className="space-y-6">
                                <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-400 via-secondary to-accent leading-tight drop-shadow-2xl italic">
                                    IMPOSTOR
                                </h1>
                                <p className="text-primary/40 font-bold text-sm leading-relaxed px-4">Engaña a los demás. No dejes rastro.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="inline-block px-12 py-8 rounded-[2.5rem] bg-secondary shadow-[0_24px_48px_-12px_rgba(246,114,128,0.5)] border border-white/20">
                                    <h1 className="text-5xl font-black text-white tracking-tight leading-tight">{room.secretWord}</h1>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Temática</p>
                                    <p className="text-primary font-bold text-xl">{THEMES[room.config.theme as ThemeKey].label}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center justify-between mb-6 px-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-primary/50">
                                    <Users className="h-4 w-4" /> Agentes
                                </h3>
                                <span className="text-[10px] font-black text-secondary tabular-nums">{room.players.length} Conectados</span>
                            </div>
                            <div className="grid gap-4">
                                {room.players.map((p: any) => (
                                    <div
                                        key={p.id}
                                        className={`flex items-center justify-between p-5 rounded-[2rem] transition-all ${p.id === playerId ? 'bg-secondary text-white shadow-2xl shadow-secondary/30 scale-[1.02]' : 'bg-muted/30 border border-white/5'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-14 w-14 rounded-[1.2rem] flex items-center justify-center font-black text-2xl border ${p.id === playerId ? 'bg-white/20 border-white/40 shadow-inner' : 'bg-dark border-white/10'}`}>
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-black text-xl tracking-tight leading-none">{p.name}</span>
                                        </div>
                                        {p.id === playerId && (
                                            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Tú</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {room.turnOrder && (
                            <section className="pb-12">
                                <div className="rounded-[3rem] bg-muted/20 p-10 border border-white/5 shadow-inner">
                                    <h3 className="text-[11px] font-black text-primary/20 uppercase tracking-[0.4em] mb-10 text-center">Protocolo de Habla</h3>
                                    <div className="space-y-8 relative">
                                        <div className="absolute left-[9px] top-3 bottom-3 w-px bg-white/5" />
                                        {room.turnOrder.map((name: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-6 relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                                                <div className={`w-5 h-5 rounded-full border-2 z-10 transition-all ${idx === 0 ? 'bg-secondary border-secondary shadow-[0_0_20px_rgba(246,114,128,0.6)] scale-110' : 'bg-dark border-white/10'}`} />
                                                <div className="flex flex-col">
                                                    <span className={`text-2xl font-black tracking-tight ${idx === 0 ? 'text-white' : 'text-primary/30'}`}>{name}</span>
                                                    {idx === 0 && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                                                            <span className="text-[10px] font-black text-secondary/80 uppercase tracking-widest">Inicia Protocolo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Global sticky actions for Mobile could stay here if needed */}
                {isAdmin && (
                    <div className="fixed bottom-10 left-0 right-0 px-6 z-[100] md:bottom-20 pointer-events-none">
                        <div className="max-w-md mx-auto pointer-events-auto">
                            <button
                                onClick={handleReset}
                                className="w-full rounded-[2rem] bg-accent py-7 font-black text-xl text-white shadow-[0_24px_48px_-8px_rgba(192,108,132,0.6)] border border-accent/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <RotateCcw className="w-6 h-6" />
                                <span>Nuevo Juego</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // View: Lobby
    return (
        <div className="flex min-h-svh flex-col items-center bg-dark p-6 text-primary overflow-x-hidden pb-12">
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-[10%] left-[0%] w-[100%] h-[50%] bg-accent/20 blur-[130px] rounded-full" />
            </div>

            <div className="relative w-full max-w-sm flex flex-col min-h-full">
                <header className="w-full flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">IMPOSTOR</span>
                    <div className="rounded-2xl bg-white/5 px-4 py-2.5 border border-white/10 flex items-center gap-3 backdrop-blur-xl group">
                        <Key className="h-4 w-4 text-primary/30 group-hover:text-secondary transition-colors" />
                        <span className="font-mono font-black tracking-widest text-primary/80 uppercase text-sm leading-none pt-0.5">{token}</span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center text-center mb-16 px-4">
                    <div className="relative mb-10 group">
                        <div className="absolute inset-[-10px] bg-secondary/20 blur-[40px] rounded-full animate-pulse" />
                        <div className="relative h-40 w-40 rounded-[3rem] bg-secondary flex items-center justify-center text-white border border-white/20 shadow-2xl transform hover:rotate-6 transition-transform">
                            <Users className="h-20 w-20" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-accent p-4 rounded-3xl border-4 border-dark shadow-xl animate-bounce">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-4 leading-tight uppercase italic drop-shadow-2xl">Esperando...</h1>
                    <p className="text-primary/30 font-bold text-lg leading-relaxed">Envía el token a los demás agentes para infiltrarse</p>
                </div>

                <div className="bg-muted/30 rounded-[3.5rem] p-10 border border-white/5 backdrop-blur-3xl shadow-[0_48px_80px_-24px_rgba(0,0,0,0.6)] relative overflow-hidden mb-12">
                    <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
                        <div className="text-left">
                            <h3 className="font-black text-3xl tracking-tight mb-1 uppercase italic">Estado</h3>
                            <p className="text-[9px] font-black text-primary/20 uppercase tracking-[0.4em]">Frecuencia Infiltrada</p>
                        </div>
                        <div className="flex items-baseline gap-1 bg-white/5 px-6 py-3 rounded-[1.5rem] border border-white/10">
                            <span className="text-5xl font-black text-secondary tabular-nums leading-none">{room?.players.length || 0}</span>
                            <span className="text-primary/20 text-xl font-black leading-none">/ {room?.config.maxPlayers || 0}</span>
                        </div>
                    </div>

                    <div className="grid gap-5">
                        {room?.players.map((p: any) => (
                            <div key={p.id} className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-dark border border-white/10 flex items-center justify-center text-2xl font-black shadow-inner">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-black text-2xl tracking-tight text-primary/80">{p.name}</span>
                                </div>
                                {p.id === playerId && (
                                    <div className="bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20 scale-90">
                                        <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Tú</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(room?.config.maxPlayers || 0) > (room?.players.length || 0) && (
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/2 cursor-wait group">
                                <Loader2 className="w-10 h-10 text-primary/10 mb-4 animate-spin group-hover:text-secondary/20 transition-colors" />
                                <span className="text-[10px] font-black text-primary/10 uppercase tracking-[0.5em]">Buscando Señal</span>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="w-full py-6">
                    <div className="flex items-center gap-6 justify-center max-w-[280px] mx-auto opacity-30">
                        <div className="h-px flex-1 bg-white/10" />
                        <div className="flex gap-4">
                            <Shield className="w-4 h-4" />
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                </footer>
            </div>
        </div>
    )
}


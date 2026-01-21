'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Users, Shield, BookOpen, Key, Loader2, ArrowRight, RotateCcw } from 'lucide-react'
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
            <div className="flex min-h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">{error}</h1>
                <button onClick={() => router.push('/')} className="rounded-xl bg-indigo-600 px-6 py-3 font-bold">Volver al inicio</button>
            </div>
        )
    }

    // View: Registration
    if (!isRegistered) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 to-black p-4 text-white">
                <div className="w-full max-w-sm rounded-3xl bg-white/5 p-8 border border-white/10 shadow-2xl backdrop-blur-md">
                    <h2 className="text-2xl font-bold mb-6 text-center">Registra tu nombre</h2>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Tu nombre o apodo"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            required
                            maxLength={15}
                            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-4 text-center text-xl outline-none focus:border-indigo-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 py-4 font-bold transition-all hover:bg-indigo-500 flex items-center justify-center gap-2"
                        >
                            Entrar a la sala <ArrowRight className="h-5 w-5" />
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
            <div className="flex min-h-screen flex-col items-center bg-black p-6 text-white overflow-y-auto pb-20">
                <div className="w-full max-w-md">
                    <header className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-mono text-zinc-400">#{token}</span>
                        </div>
                        {isAdmin && (
                            <button onClick={handleReset} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                                <RotateCcw className="h-4 w-4" /> Nuevo Juego
                            </button>
                        )}
                    </header>

                    <div className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-8 text-center border border-indigo-500/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        <p className="text-sm font-bold uppercase tracking-widest text-indigo-300 mb-2">Tu Palabra Secreta</p>
                        {me?.role === 'impostor' ? (
                            <h1 className="text-4xl font-black text-rose-500 drop-shadow-lg">¡ERES EL IMPOSTOR!</h1>
                        ) : (
                            <h1 className="text-5xl font-black text-white drop-shadow-lg">{room.secretWord}</h1>
                        )}
                        <p className="mt-4 text-xs text-zinc-500">Temática: {THEMES[room.config.theme as ThemeKey].label}</p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-400" /> Jugadores
                        </h3>
                        <div className="grid gap-3">
                            {room.players.map((p: any) => (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl bg-white/5 border transition-all ${p.id === playerId ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg border border-white/10">
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="font-bold">{p.name}</span>
                                            {p.id === playerId && <span className="ml-2 text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded uppercase">Tú</span>}
                                        </div>
                                    </div>
                                    {isAdmin && <span className="text-[10px] text-zinc-600 uppercase">#{p.id.slice(0, 4)}</span>}
                                </div>
                            ))}
                        </div>

                        {room.turnOrder && (
                            <div className="mt-10 rounded-3xl bg-white/5 p-6 border border-white/10 border-dashed">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 text-center">Orden de participación</h3>
                                <div className="space-y-3">
                                    {room.turnOrder.map((name: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 group">
                                            <span className="text-indigo-500 font-mono font-bold w-4">{idx + 1}.</span>
                                            <span className={`text-lg ${idx === 0 ? 'text-white font-bold' : 'text-zinc-400'}`}>{name}</span>
                                            {idx === 0 && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">Inicia</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // View: Lobby
    return (
        <div className="flex min-h-screen flex-col items-center bg-black p-6 text-white">
            <div className="w-full max-w-md">
                <header className="flex items-center justify-between mb-12">
                    <span className="text-xl font-black tracking-tighter text-indigo-400">IMPOSTOR</span>
                    <div className="rounded-full bg-white/5 px-4 py-2 border border-white/10 text-sm font-mono flex items-center gap-2">
                        <Key className="h-4 w-4 text-zinc-500" /> {token}
                    </div>
                </header>

                <div className="text-center mb-12">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600/20 text-indigo-500 animate-pulse border border-indigo-500/30">
                        <Users className="h-12 w-12" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Esperando jugadores...</h1>
                    <p className="text-zinc-500">Comparte el token <span className="text-white font-mono">{token}</span> para que otros se unan.</p>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold">Lista de espera</h3>
                        <span className="text-sm text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg">
                            {room.players.length} / {room.config.maxPlayers}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {room.players.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold uppercase">
                                    {p.name.charAt(0)}
                                </div>
                                <span className="font-medium">{p.name}</span>
                                {p.id === playerId && <span className="ml-auto text-[10px] uppercase text-indigo-400 font-bold">Tú</span>}
                            </div>
                        ))}

                        {Array.from({ length: room.config.maxPlayers - room.players.length }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 border-dashed opacity-40">
                                <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-sm">?</div>
                                <span className="italic text-sm">Esperando...</span>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="mt-12 text-center text-xs text-zinc-600 space-y-2">
                    <div className="flex items-center justify-center gap-4">
                        <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> {room.config.impostorsCount} Impostor{room.config.impostorsCount > 1 ? 'es' : ''}</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {THEMES[room.config.theme as ThemeKey].label}</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}

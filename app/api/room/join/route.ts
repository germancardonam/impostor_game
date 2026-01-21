import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(req: NextRequest) {
    try {
        const { token, name, playerId } = await req.json()

        if (!token || !name || !playerId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const roomKey = `room:${token}`
        const data: any = await redis.get(roomKey)

        if (!data) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        if (data.status !== 'lobby') {
            return NextResponse.json({ error: 'Game already started' }, { status: 400 })
        }

        // Check if player already in
        if (data.players.some((p: any) => p.id === playerId)) {
            return NextResponse.json({ success: true, room: data })
        }

        if (data.players.length >= data.config.maxPlayers) {
            return NextResponse.json({ error: 'Room full' }, { status: 400 })
        }

        // Add player
        data.players.push({ id: playerId, name, role: 'native' })

        // If full, start game and assign roles
        if (data.players.length === data.config.maxPlayers) {
            data.status = 'playing'

            // Assign impostors
            const indices = Array.from({ length: data.players.length }, (_, i) => i)
            const impostorIndices: number[] = []

            for (let i = 0; i < data.config.impostorsCount; i++) {
                const randomIndex = Math.floor(Math.random() * indices.length)
                impostorIndices.push(indices.splice(randomIndex, 1)[0])
            }

            data.players.forEach((p: any, idx: number) => {
                if (impostorIndices.includes(idx)) {
                    p.role = 'impostor'
                }
            })

            // Generate initial turn order
            data.turnOrder = [...data.players].sort(() => Math.random() - 0.5).map(p => p.name)
        }

        await redis.set(roomKey, JSON.stringify(data), { ex: 86400 })

        return NextResponse.json({ success: true, room: data })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

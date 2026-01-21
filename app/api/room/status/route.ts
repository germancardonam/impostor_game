import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { THEMES, ThemeKey } from '@/lib/constants'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const data = await redis.get(`room:${token}`)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(data)
}

// Route to reset game
export async function PATCH(req: NextRequest) {
    const { token } = await req.json()
    const roomKey = `room:${token}`
    const data: any = await redis.get(roomKey)

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Pick a new secret word
    const themeData = THEMES[data.config.theme as ThemeKey]
    const secretWord = themeData.words[Math.floor(Math.random() * themeData.words.length)]

    data.status = 'playing'
    data.secretWord = secretWord

    // Re-assign impostors
    const indices = Array.from({ length: data.players.length }, (_, i) => i)
    const impostorIndices: number[] = []

    for (let i = 0; i < data.config.impostorsCount; i++) {
        const randomIndex = Math.floor(Math.random() * indices.length)
        impostorIndices.push(indices.splice(randomIndex, 1)[0])
    }

    data.players.forEach((p: any, idx: number) => {
        p.role = impostorIndices.includes(idx) ? 'impostor' : 'native'
    })

    // New randomized turn order
    data.turnOrder = [...data.players].sort(() => Math.random() - 0.5).map(p => p.name)

    await redis.set(roomKey, JSON.stringify(data), { ex: 86400 })
    return NextResponse.json({ success: true, room: data })
}

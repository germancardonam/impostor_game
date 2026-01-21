import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { THEMES, ThemeKey } from '@/lib/constants'

export async function POST(req: NextRequest) {
    try {
        const { players, impostors, theme, token } = await req.json()

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        const exists = await redis.exists(`room:${token}`)
        if (exists) {
            return NextResponse.json({ error: 'Room already exists' }, { status: 409 })
        }

        // Pick a random word from the theme
        const themeData = THEMES[theme as ThemeKey]
        const secretWord = themeData.words[Math.floor(Math.random() * themeData.words.length)]

        const roomData = {
            config: {
                maxPlayers: players,
                impostorsCount: impostors,
                theme,
            },
            status: 'lobby', // lobby, playing
            secretWord,
            players: [], // { id, name, role }
            createdAt: Date.now(),
        }

        await redis.set(`room:${token}`, JSON.stringify(roomData), { ex: 86400 }) // 24h expiration

        return NextResponse.json({ success: true, token })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

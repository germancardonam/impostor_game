import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    const exists = await redis.exists(`room:${token}`)
    if (exists) {
        return NextResponse.json({ success: true })
    } else {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
}

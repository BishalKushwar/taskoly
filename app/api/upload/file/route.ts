import { NextRequest } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { GridFSBucket } from 'mongodb'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  if (!path) return new Response('Missing path', { status: 400 })

  const db = await getDb()
  const bucket = new GridFSBucket(db, { bucketName: 'uploads' })
  const range = request.headers.get('range')

  const downloadStream = bucket.openDownloadStreamByName(path)

  return new Response(downloadStream as any, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...(range ? { 'Accept-Ranges': 'bytes' } : {}),
    },
  })
}



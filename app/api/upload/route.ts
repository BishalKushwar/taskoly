import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { GridFSBucket } from 'mongodb'

export async function POST(request: NextRequest) {
  console.log('Upload API called')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'avatars'

    console.log('File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type
    })

    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    console.log('Generated filename:', fileName)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('File converted to buffer, size:', buffer.length)

    // Upload to MongoDB GridFS
    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' })
    await new Promise<void>((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(`${folder}/${fileName}`, {
        contentType: file.type,
        metadata: { folder, originalName: file.name },
      })
      uploadStream.on('error', reject)
      uploadStream.on('finish', () => resolve())
      uploadStream.end(buffer)
    })

    const downloadUrl = `/api/upload/file?path=${encodeURIComponent(`${folder}/${fileName}`)}`

    return NextResponse.json({ success: true, url: downloadUrl, path: `${folder}/${fileName}` })

  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: error
    }, { status: 500 })
  }
}

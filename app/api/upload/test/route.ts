import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('Test endpoint called')
    
    // Test MongoDB connection
    const db = await getDb()
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      success: true,
      message: 'API is working',
      collections: collections.map(c => c.name),
    })
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

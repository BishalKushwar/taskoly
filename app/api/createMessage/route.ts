import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)

export async function POST(request: Request) {
    try {
        const { messages } = await request.json()

        // Initialize the model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        })

        // Convert the messages array to a single prompt
        const prompt = messages.map((msg: any) => msg.content).join('\n')

        // Generate content
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({
            data: {
                choices: [{
                    message: {
                        content: text
                    }
                }]
            }
        })
    } catch (error: any) {
        console.error('Gemini API error:', error.message)
        return NextResponse.json(
            {
                error: 'Failed to get AI response',
                details: error.message
            },
            { status: 500 }
        )
    }
}
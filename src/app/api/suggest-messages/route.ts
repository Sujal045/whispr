import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. Avoid sensitive topics.`

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    })

    return NextResponse.json({
      questions: text.split('||').map(q => q.trim()),
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

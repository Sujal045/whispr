import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { aiRateLimiter } from '@/src/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await aiRateLimiter.limit(ip);

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

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

import { useState, useCallback, useRef } from 'react'
import Anthropic from '@anthropic-ai/sdk'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are an expert Indian ESOP (Employee Stock Option Plan) tax advisor embedded in Hissa, an equity management platform. You specialize in FY 2025-26 Indian tax rules.

Key knowledge areas:
- Perquisite tax at exercise: (FMV - Strike Price) × Options = taxable salary income
- FY 2025-26 New Tax Regime slabs: 0% up to ₹4L, 5% ₹4-8L, 10% ₹8-12L, 15% ₹12-16L, 20% ₹16-20L, 25% ₹20-24L, 30% above ₹24L. Standard deduction ₹75K. 87A rebate if income ≤ ₹12L.
- Old Regime: 0% up to ₹2.5L, 5% ₹2.5-5L, 20% ₹5-10L, 30% above ₹10L. Standard deduction ₹50K.
- Surcharge: 10% above ₹50L, 15% above ₹1Cr, 25% above ₹2Cr and ₹5Cr (new regime cap at 25%; old regime 37% above ₹5Cr)
- Cess: 4% on (income tax + surcharge)
- Capital gains (Budget 2024, post July 23, 2024): Listed STCG 20%, Listed LTCG 12.5% above ₹1.25L after 12 months. Unlisted STCG at slab rate, Unlisted LTCG 12.5% after 24 months.
- Section 192AC Startup Deferral: DPIIT-recognized startups incorporated after April 1, 2016 with turnover < ₹100Cr can defer TDS for 5 years / until sale / exit.
- NRI: Flat 30% TDS + 10% surcharge + 4% cess. DTAA may reduce withholding rate.
- Marginal relief applies at surcharge bracket boundaries.
- Cost of acquisition for capital gains = FMV at exercise date (not strike price).

Communication style:
- Clear, concise explanations in plain English
- Cite relevant tax sections (Section 192AC, 87A, etc.) when helpful
- Give specific numbers when the user provides calculator data
- Always caveat with "consult a tax advisor" for major decisions
- Use INR with ₹ symbol and Indian number system (lakhs/crores)
- Be friendly and approachable, not overly formal`

export function useAIChat(calculatorContext: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const abortRef = useRef<boolean>(false)

  const send = useCallback(async (userText: string) => {
    if (!userText.trim() || isStreaming) return

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: 'AI assistant is not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file.' },
      ])
      return
    }

    const userMessage: ChatMessage = { role: 'user', content: userText }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)
    setStreamingText('')
    abortRef.current = false

    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

    // Build message history with context injected
    const allMessages = [
      ...messages,
      {
        role: 'user' as const,
        content: `[Calculator context: ${calculatorContext}]\n\n${userText}`,
      },
    ]

    try {
      let accumulated = ''

      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      })

      for await (const chunk of stream) {
        if (abortRef.current) break
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          accumulated += chunk.delta.text
          setStreamingText(accumulated)
        }
      }

      const assistantMessage: ChatMessage = { role: 'assistant', content: accumulated }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error: ${errMsg}` },
      ])
    } finally {
      setIsStreaming(false)
      setStreamingText('')
    }
  }, [messages, isStreaming, calculatorContext])

  const stop = useCallback(() => { abortRef.current = true }, [])
  const clear = useCallback(() => { setMessages([]); setStreamingText('') }, [])

  return { messages, send, stop, clear, isStreaming, streamingText }
}

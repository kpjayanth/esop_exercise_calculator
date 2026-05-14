import { useState, useRef, useEffect } from 'react'
import { X, Send, Trash2, Sparkles, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIChat } from '@/hooks/useAIChat'
import type { PerquisiteInputs, PerquisiteResult } from '@/types/tax.types'
import { formatCompact, formatPercent } from '@/lib/formatters'

interface Props {
  open: boolean
  onClose: () => void
  inputs: PerquisiteInputs
  result: PerquisiteResult
}

const SUGGESTED_QUESTIONS = [
  'Why is surcharge applying to me?',
  'Should I exercise now or wait till next FY?',
  'What happens if I exercise in two tranches?',
  'Which tax regime is better for me?',
  'Am I eligible for startup ESOP deferral?',
]

function buildContext(inputs: PerquisiteInputs, result: PerquisiteResult): string {
  return JSON.stringify({
    grantType: inputs.grantType,
    strikePrice: inputs.strikePrice,
    fmvAtExercise: inputs.fmvAtExercise,
    numberOfOptions: inputs.numberOfOptions,
    annualSalaryIncome: inputs.annualSalaryIncome,
    regime: inputs.regime,
    companyType: inputs.companyType,
    residentialStatus: inputs.residentialStatus,
    perquisite: result.perquisite,
    totalTax: result.totalTax,
    netGain: result.netGain,
    effectiveTaxRate: formatPercent(result.effectiveTaxRate),
    surcharge: result.surcharge,
    grossValue: result.grossValue,
    applied87A: result.applied87A,
    compactSummary: `₹${formatCompact(result.perquisite)} perquisite, ₹${formatCompact(result.totalTax)} tax (${formatPercent(result.effectiveTaxRate)} effective), ₹${formatCompact(result.netGain)} net gain`,
  })
}

export function AIAssistant({ open, onClose, inputs, result }: Props) {
  const [input, setInput] = useState('')
  const context = buildContext(inputs, result)
  const { messages, send, stop, clear, isStreaming, streamingText } = useAIChat(context)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSend() {
    if (!input.trim()) return
    send(input.trim())
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#E85936] to-[#f97316] flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">AI Tax Advisor</p>
                  <p className="text-xs text-[#9CA3AF]">FY 2025-26 · Powered by Claude</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={clear} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151] transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Context pill */}
            {result.perquisite > 0 && (
              <div className="px-4 py-2 bg-[#FFF7F5] border-b border-[#FCE7E1]">
                <p className="text-xs text-[#E85936]">
                  Context: {formatCompact(result.perquisite)} perquisite · {formatCompact(result.totalTax)} tax · {formatPercent(result.effectiveTaxRate)} rate
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && !isStreaming ? (
                <div className="space-y-4">
                  <div className="text-center pt-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E85936] to-[#f97316] flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-[#111827]">Ask anything about your ESOP taxes</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">I have full context of your current calculation</p>
                  </div>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => { send(q) }}
                        className="w-full text-left text-sm text-[#374151] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-3 py-2.5 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                        msg.role === 'user'
                          ? 'bg-[#E85936] text-white rounded-br-sm'
                          : 'bg-[#F3F4F6] text-[#374151] rounded-bl-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isStreaming && streamingText && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] bg-[#F3F4F6] text-[#374151] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-6">
                        <div className="whitespace-pre-wrap">{streamingText}</div>
                        <span className="inline-block w-1.5 h-3.5 bg-[#E85936] animate-pulse ml-0.5 align-middle" />
                      </div>
                    </div>
                  )}
                  {isStreaming && !streamingText && (
                    <div className="flex justify-start">
                      <div className="bg-[#F3F4F6] rounded-2xl rounded-bl-sm px-3.5 py-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your ESOP tax situation..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#374151] focus:border-[#E85936] focus:outline-none transition-colors max-h-32 leading-5"
                  style={{ height: 'auto', minHeight: '40px' }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = `${el.scrollHeight}px`
                  }}
                />
                {isStreaming ? (
                  <button
                    onClick={stop}
                    className="w-9 h-9 rounded-xl bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors flex items-center justify-center shrink-0"
                  >
                    <Square size={14} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl bg-[#E85936] text-white hover:bg-[#d14e2e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
                  >
                    <Send size={14} />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#C4C4C4] mt-1.5 text-center">
                Estimates only · Not financial advice · Consult a CA
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

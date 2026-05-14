// Lightweight shadcn-style primitives (no external shadcn dependency needed)
import { cn } from '@/lib/utils'
import React from 'react'

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-xl border border-[#E5E7EB] shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}
export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-[#E85936] border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}
export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-[#E85936] text-white hover:bg-[#d14e2e] disabled:opacity-50',
    secondary: 'bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F3F4F6]',
    ghost: 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-sm font-medium',
  }
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85936] disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string
}
export function Input({ className, prefix, ...props }: InputProps) {
  if (prefix) {
    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm text-[#6B7280] pointer-events-none">{prefix}</span>
        <input
          className={cn('w-full h-9 rounded-xl border border-[#E5E7EB] bg-white pl-7 pr-3 text-sm text-[#374151] focus:border-[#E85936] focus:outline-none transition-colors', className)}
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      className={cn('w-full h-9 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151] focus:border-[#E85936] focus:outline-none transition-colors', className)}
      {...props}
    />
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-xs font-medium text-[#6B7280] leading-4', className)} {...props}>
      {children}
    </label>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full h-9 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#374151] focus:border-[#E85936] focus:outline-none transition-colors appearance-none cursor-pointer', className)}
      {...props}
    >
      {children}
    </select>
  )
}

// ── Toggle group ──────────────────────────────────────────────────────────────
interface ToggleOption<T> {
  value: T
  label: string
}
interface ToggleGroupProps<T> {
  options: ToggleOption<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}
export function ToggleGroup<T extends string>({ options, value, onChange, className }: ToggleGroupProps<T>) {
  return (
    <div className={cn('flex rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-0.5 gap-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 h-7 text-xs font-medium rounded-lg transition-all',
            value === opt.value
              ? 'bg-white text-[#111827] shadow-sm border border-[#E5E7EB]'
              : 'text-[#6B7280] hover:text-[#374151]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-[#F1F5F9]', className)} />
}

// ── Tooltip wrapper ───────────────────────────────────────────────────────────
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-56 bg-[#1C1C1E] text-white text-[11px] leading-relaxed rounded-lg px-3 py-2 shadow-xl whitespace-normal">
        {text}
        {/* Arrow */}
        <span className="absolute top-full left-4 -translate-y-px border-4 border-transparent border-t-[#1C1C1E]" />
      </span>
    </span>
  )
}

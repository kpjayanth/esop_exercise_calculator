// Lightweight shadcn-style primitives — Hissa DS compliant
import { cn } from '@/lib/utils'
import { formatCompact, formatINR } from '@/lib/formatters'
import React from 'react'

// DS tokens (inlined for Tailwind JIT)
// heading: #071437 | body: #252F4A | input: #4B5675 | muted: #99A1B7
// page-bg: #F6F9FB | card-border: #F1F1F4 | field-border: #DBDFE9
// shadow-ds: 0 3px 4px rgba(0,0,0,0.03)

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white rounded-lg border border-[#F1F1F4]', className)}
      style={{ boxShadow: '0 3px 4px rgba(0,0,0,0.03)', ...((props as any).style ?? {}) }}
      {...props}
    >
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
    default: 'bg-[#F6F9FB] text-[#4B5675] border-[#F1F1F4]',
    success: 'bg-[#E1F5EE] text-[#085041]',
    warning: 'bg-[#FEF9EE] text-[#854F0B]',
    error: 'bg-[#FEF3F2] text-[#B42318]',
    info: 'bg-[#EEF4FB] text-[#0C224A]',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#F1F1F4] text-xs font-medium', variants[variant], className)} {...props}>
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
    secondary: 'bg-white text-[#E85936] border border-[#E85936] hover:bg-[#FDF1EE]',
    ghost: 'bg-[#F5F8FA] text-[#252F4A] hover:bg-[#EAECF0]',
  }
  // DS: medium = h-8 (32px), large = h-11 (44px), button radius = 6px
  const sizes = {
    sm: 'h-7 px-3 text-[11px] font-semibold tracking-[0.3px]',
    md: 'h-8 px-[14px] text-[12px] font-semibold tracking-[0.3px]',
    lg: 'h-11 px-5 text-[14px] font-[500] tracking-[0.35px]',
  }
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-1.5 rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85936] disabled:cursor-not-allowed', variants[variant], sizes[size], className)}
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
        <span className="absolute left-3 text-sm text-[#99A1B7] pointer-events-none">{prefix}</span>
        <input
          className={cn('w-full h-9 rounded-lg border border-[#DBDFE9] bg-white pl-7 pr-3 text-sm text-[#4B5675] placeholder:text-[#99A1B7] focus:border-[#E85936] focus:outline-none transition-colors', className)}
          {...props}
        />
      </div>
    )
  }
  return (
    <input
      className={cn('w-full h-9 rounded-lg border border-[#DBDFE9] bg-white px-3 text-sm text-[#4B5675] placeholder:text-[#99A1B7] focus:border-[#E85936] focus:outline-none transition-colors', className)}
      {...props}
    />
  )
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-xs font-medium text-[#99A1B7] leading-4', className)} {...props}>
      {children}
    </label>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('w-full h-9 rounded-lg border border-[#DBDFE9] bg-white px-3 text-sm text-[#4B5675] focus:border-[#E85936] focus:outline-none transition-colors appearance-none cursor-pointer', className)}
      {...props}
    >
      {children}
    </select>
  )
}

// ── ToggleGroup ───────────────────────────────────────────────────────────────
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
    <div className={cn('flex rounded-[6px] border border-[#F1F1F4] bg-[#F5F8FA] p-0.5 gap-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 h-7 text-xs font-medium rounded-[4px] transition-all',
            value === opt.value
              ? 'bg-white text-[#071437] shadow-ds border border-[#F1F1F4]'
              : 'text-[#99A1B7] hover:text-[#252F4A]',
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
  return <div className={cn('border-t border-[#F1F1F4]', className)} />
}

// ── HelpIcon — DS-compliant ? circle (replaces lucide Info) ──────────────────
export function HelpIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#DBDFE9] text-[#99A1B7] text-[10px] font-semibold cursor-help select-none leading-none shrink-0',
        className,
      )}
      aria-label="Help"
    >
      ?
    </span>
  )
}

// ── Amt — compact number with full-value tooltip on hover ─────────────────────
export function Amt({ value, className }: { value: number; className?: string }) {
  const compact = formatCompact(value)
  if (Math.abs(value) < 1000) return <span className={className}>{compact}</span>
  const full = formatINR(value, 0)
  return (
    <span className={cn('relative group/amt cursor-help', className)}>
      {compact}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/amt:block z-50 bg-[#071437] text-white text-[11px] font-semibold rounded-lg px-3 py-1.5 shadow-ds whitespace-nowrap">
        {full}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#071437]" />
      </span>
    </span>
  )
}

// ── Tooltip wrapper ───────────────────────────────────────────────────────────
export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 w-56 bg-[#071437] text-white text-[11px] leading-relaxed rounded-lg px-3 py-2 shadow-ds whitespace-normal">
        {text}
        <span className="absolute top-full left-4 -translate-y-px border-4 border-transparent border-t-[#071437]" />
      </span>
    </span>
  )
}

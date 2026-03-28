'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

 
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] py-4 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--bg-base)]/95 backdrop-blur-xl shadow-[0_1px_0_var(--border-light)]'
            : ''
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          {}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--text-main)] relative z-[110]"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--text-main)]/5 border border-[var(--border-light)] shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
               <Image src="/real-logo.png" alt="TrackMyMoney Logo" width={24} height={24} className="w-6 h-6 opacity-90 group-hover:opacity-100 transition-opacity dark:invert" />
            </div>
            Track<span className="text-[var(--text-muted)]">My</span>Money
          </Link>

          {}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[13px] font-medium transition-all border border-[var(--border-light)] text-[var(--text-main)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-dark)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[13px] font-medium transition-all bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 shadow-sm"
            >
              Get started free
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="relative z-[110] inline-flex items-center justify-center px-4 py-2 rounded-full text-[12px] font-bold border border-[var(--border-light)] text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
            >
              Log in
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative z-[110] w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-main)]"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {}
      <div
        className={`fixed inset-0 z-[105] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 z-[106] h-full w-[280px] bg-[var(--bg-base)] border-l border-[var(--border-light)] shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col pt-24 px-6 gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-[var(--text-main)] py-3 border-b border-[var(--border-light)] hover:text-[var(--accent)] transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-6">
            <div className="flex items-center justify-between py-3 border-b border-[var(--border-light)]">
              <span className="text-sm font-medium text-[var(--text-muted)]">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium border border-[var(--border-light)] text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium bg-[var(--text-main)] text-[var(--bg-base)] hover:opacity-90 shadow-sm"
            >
              Get started free <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
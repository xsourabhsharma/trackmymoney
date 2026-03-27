'use client'

import React from 'react'
import { Plus, Wallet, FileText, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'

interface OnboardingWizardProps {
  userName: string
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  return (
    <div className="w-full h-full min-h-[75vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 p-6">
      
      {}
      <div className="max-w-3xl w-full glass-card rounded-[40px] p-10 md:p-16 text-center relative overflow-hidden group">
        
        {}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-[var(--accent)]/20 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--income-green)]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none group-hover:bg-[var(--income-green)]/20 transition-colors duration-1000" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[var(--accent)] to-indigo-500 rounded-3xl flex items-center justify-center rotate-12 mb-8 shadow-2xl shadow-[var(--accent)]/30 group-hover:rotate-0 transition-transform duration-500">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--text-main)] mb-6">
            Welcome to <br/>
            <span className="text-gradient-accent">TrackMyMoney</span>, {userName}
          </h1>
          
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-12 font-medium">
            Your financial intelligence hub is ready. Setup takes less than 2 minutes. Let's build your unified dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            
            {}
            <Link 
              href="/dashboard/settings"
              className="group/card relative p-6 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-light)] rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center mb-4 shadow-sm group-hover/card:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-[var(--text-main)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-1 uppercase tracking-wider">1. Link Account</h3>
                <p className="text-sm text-[var(--text-muted)]">Set up your primary bank, wallet, or cash tracking account.</p>
              </div>
              <ArrowRight className="w-5 h-5 absolute top-6 right-6 text-[var(--text-muted)] group-hover/card:text-[var(--text-main)] group-hover/card:translate-x-1 transition-all" />
            </Link>

            {}
            <Link 
              href="?add=true"
              className="group/card relative p-6 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-light)] rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-light)] flex items-center justify-center mb-4 shadow-sm group-hover/card:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-[var(--text-main)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-1 uppercase tracking-wider">2. First Transaction</h3>
                <p className="text-sm text-[var(--text-muted)]">Log your initial balance or a recent expense to jumpstart the AI.</p>
              </div>
              <ArrowRight className="w-5 h-5 absolute top-6 right-6 text-[var(--text-muted)] group-hover/card:text-[var(--text-main)] group-hover/card:translate-x-1 transition-all" />
            </Link>

          </div>

          <div className="my-10 h-px w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-[var(--border-dark)] to-transparent opacity-50" />

          {}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium">
            <span className="text-[var(--text-muted)] flex items-center gap-2">
              <Zap className="w-4 h-4" /> Power User?
            </span>
            <Link 
              href="/dashboard/auto-parse"
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-main)] text-[var(--bg-base)] rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md font-bold uppercase tracking-widest"
            >
              <FileText className="w-4 h-4" />
              Batch CSV Import
            </Link>
          </div>

        </div>
      </div>
      
      {}
      <div className="mt-8 flex items-center gap-6 text-[12px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Bank-Grade Encryption</span>
        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Powered Insights</span>
      </div>
    </div>
  )
}

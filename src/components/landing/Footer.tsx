import Link from 'next/link'
import Image from 'next/image'

const productLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/dashboard', label: 'Dashboard Login' },
]

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-base)] pt-16 pb-8 border-t border-[var(--border-light)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight mb-4">
              <Image src="/logo.svg" alt="TrackMyMoney" width={24} height={24} className="w-6 h-6" />
              Track<span className="text-[var(--text-muted)]">My</span>Money
            </Link>
            <p className="text-sm text-[var(--text-muted)] max-w-[300px] leading-relaxed">
              The modern, unified, completely secure workspace for your personal finances. Built for individuals and freelancers.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-[12px] uppercase tracking-widest">Product</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[var(--text-muted)]">
              {productLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[var(--text-main)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-[12px] uppercase tracking-widest">Legal</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[var(--text-muted)]">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-[var(--text-main)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[var(--border-light)] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-[12px] text-[var(--text-muted)]">
            © 2026 TrackMyMoney. All rights reserved.
          </div>
          <div className="text-[12px] text-[var(--text-muted)]">
            Made with care for your financial peace of mind.
          </div>
        </div>
      </div>
    </footer>
  )
}

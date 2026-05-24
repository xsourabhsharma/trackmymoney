'use client'

import { useMemo, useState, useTransition } from 'react'
import { Copy, KeyRound, PlugZap, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExternalAccessTokenSummary } from '@/app/dashboard/settings/data'
import {
  createExternalAccessTokenAction,
  revokeExternalAccessTokenAction,
} from '@/app/dashboard/settings/mcp-actions'
import type { FinanceToolScope } from '@/lib/finance-tools/types'

interface Props {
  tokens: ExternalAccessTokenSummary[]
}

const DEFAULT_SCOPES: FinanceToolScope[] = [
  'read:all',
  'write:transactions',
  'write:budgets',
  'write:subscriptions',
  'write:goals',
  'write:debts',
]

function formatDate(value: string | null) {
  if (!value) return 'Never'
  return new Date(value).toLocaleString()
}

export function McpAccessSettingsSection({ tokens }: Props) {
  const [tokenName, setTokenName] = useState('My AI tools')
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const origin = typeof window === 'undefined' ? 'https://your-trackmymoney-domain.com' : window.location.origin
  const mcpUrl = `${origin}/api/mcp`
  const cliBase = origin

  const connectionSnippets = useMemo(() => {
    const tokenPlaceholder = createdToken || '<paste-token-here>'
    return {
      remote: JSON.stringify({
        trackmymoney: {
          url: mcpUrl,
          headers: {
            Authorization: `Bearer ${tokenPlaceholder}`,
          },
        },
      }, null, 2),
      stdio: JSON.stringify({
        trackmymoney: {
          command: 'npx',
          args: ['-y', 'mcp-remote', mcpUrl],
          env: {
            MCP_REMOTE_HEADERS: JSON.stringify({ Authorization: `Bearer ${tokenPlaceholder}` }),
          },
        },
      }, null, 2),
      cli: `trackmymoney --base-url ${cliBase} --token ${tokenPlaceholder} transaction add --amount 450 --type expense --merchant "Grocery" --date ${new Date().toISOString().slice(0, 10)}`,
    }
  }, [cliBase, createdToken, mcpUrl])

  function createToken() {
    setError(null)
    startTransition(async () => {
      try {
        const result = await createExternalAccessTokenAction({
          name: tokenName,
          scopes: DEFAULT_SCOPES,
          expiresInDays: 180,
        })
        setCreatedToken(result.token)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create token.')
      }
    })
  }

  function revokeToken(id: string) {
    setError(null)
    startTransition(async () => {
      try {
        await revokeExternalAccessTokenAction(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to revoke token.')
      }
    })
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied(null)
    }
  }

  return (
    <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-[24px] p-6 shadow-sm flex flex-col gap-6 h-full">
      <div className="pb-4 border-b border-[var(--border-light)]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
          <PlugZap className="w-4 h-4 text-[var(--accent)]" /> AI, MCP & CLI Access
        </h3>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          Connect Claude, Codex, Gemini, Antigravity, MCP clients, or the TrackMyMoney CLI with scoped user tokens.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">
          <KeyRound className="h-4 w-4 text-[var(--accent)]" />
          Create access token
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            value={tokenName}
            onChange={(event) => setTokenName(event.target.value)}
            placeholder="Token name"
            className="h-11 rounded-xl border-[var(--border-light)] bg-[var(--bg-base)]"
          />
          <Button onClick={createToken} disabled={isPending} className="h-11 rounded-xl">
            {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Generate
          </Button>
        </div>
        <div className="flex items-start gap-2 text-[11px] leading-5 text-[var(--text-muted)]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--income-green)]" />
          Tokens are shown once, stored as hashes, revocable, and scoped to read data plus confirmed finance writes.
        </div>
      </div>

      {createdToken ? (
        <div className="rounded-2xl border border-[var(--income-green)]/40 bg-[var(--income-green)]/10 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--income-green)]">New token</div>
          <textarea
            readOnly
            value={createdToken}
            className="h-20 w-full resize-none rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] p-3 font-mono text-xs text-[var(--text-main)]"
          />
          <Button type="button" variant="outline" onClick={() => copy(createdToken, 'token')} className="mt-3 h-9 rounded-full">
            <Copy className="h-3.5 w-3.5" />
            {copied === 'token' ? 'Copied' : 'Copy token'}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3">
        <Snippet title="Remote MCP" value={connectionSnippets.remote} onCopy={() => copy(connectionSnippets.remote, 'remote')} copied={copied === 'remote'} />
        <Snippet title="Stdio bridge" value={connectionSnippets.stdio} onCopy={() => copy(connectionSnippets.stdio, 'stdio')} copied={copied === 'stdio'} />
        <Snippet title="CLI example" value={connectionSnippets.cli} onCopy={() => copy(connectionSnippets.cli, 'cli')} copied={copied === 'cli'} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">Active tokens</div>
        {tokens.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border-light)] p-4 text-xs text-[var(--text-muted)]">
            No external access tokens yet.
          </div>
        ) : (
          tokens.map((token) => {
            const revoked = Boolean(token.revoked_at)
            return (
              <div key={token.id} className="flex items-center gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-[var(--text-main)]">{token.name}</div>
                  <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                    Last used: {formatDate(token.last_used_at)} · Expires: {formatDate(token.expires_at)}
                  </div>
                  <div className="mt-1 truncate text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    {revoked ? 'Revoked' : token.scopes.join(', ')}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={revoked || isPending}
                  onClick={() => revokeToken(token.id)}
                  className="h-9 rounded-full text-[var(--expense-red)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Revoke
                </Button>
              </div>
            )
          })
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--expense-red)]/30 bg-[var(--expense-red)]/10 p-3 text-xs font-medium text-[var(--expense-red)]">
          {error}
        </div>
      ) : null}
    </div>
  )
}

function Snippet({
  copied,
  onCopy,
  title,
  value,
}: {
  copied: boolean
  onCopy: () => void
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-surface)] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-main)]">{title}</div>
        <Button type="button" variant="ghost" onClick={onCopy} className="h-7 rounded-full px-2 text-[10px]">
          <Copy className="h-3 w-3" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="max-h-36 overflow-auto rounded-xl bg-[var(--bg-base)] p-3 text-[11px] leading-5 text-[var(--text-muted)]">
        {value}
      </pre>
    </div>
  )
}

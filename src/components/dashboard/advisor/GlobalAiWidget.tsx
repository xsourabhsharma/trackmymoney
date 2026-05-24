'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Sparkles, X, Minimize2, Maximize2, Mic, MicOff, Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useVoiceToText } from '@/hooks/useVoiceToText'
import { cn } from '@/lib/utils'
import { AiOrb3D } from '@/components/3d/AiOrb3D'

type WidgetState = 'minimized' | 'chat' | 'expanded'
type ChatImageData = {
  imageUrl?: string
  imageUrls?: string[]
}
type TextPart = {
  type: 'text'
  text: string
}
type ToolResult = {
  error?: string
  ok?: boolean
  success?: boolean
}
type ToolPart = {
  type?: string
  toolCallId?: string
  toolName?: string
  state?: string
  output?: ToolResult
  result?: ToolResult
  errorText?: string
}
type AdvisorMessage = {
  id: string
  role: string
  content?: unknown
  parts?: Array<TextPart | ToolPart>
  data?: ChatImageData
  toolInvocations?: ToolPart[]
}
type ChatHookCompat = {
  messages: AdvisorMessage[]
  isLoading?: boolean
  status?: string
  error?: Error
  clearError?: () => void
  sendMessage?: (message: { text: string }, options?: { body?: object }) => Promise<unknown> | unknown
}

function isTextPart(part: TextPart | ToolPart): part is TextPart {
  return part.type === 'text' && typeof (part as { text?: unknown }).text === 'string'
}

function getMessageText(message: AdvisorMessage) {
  if (typeof message.content === 'string') return message.content
  if (Array.isArray(message.content)) {
    return message.content
      .filter((part): part is TextPart => typeof part === 'object' && part !== null && (part as TextPart).type === 'text')
      .map((part) => part.text)
      .join('')
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter(isTextPart)
      .map((part) => part.text)
      .join('')
  }
  return ''
}

function getToolParts(message: AdvisorMessage) {
  if (message.toolInvocations?.length) return message.toolInvocations
  if (Array.isArray(message.parts)) {
    return message.parts.filter((part): part is ToolPart => (
      part.type === 'tool-invocation' ||
      part.type === 'dynamic-tool' ||
      (typeof part.type === 'string' && part.type.startsWith('tool-'))
    ))
  }
  return []
}

function getToolName(toolPart: ToolPart) {
  if (toolPart.toolName) return toolPart.toolName
  if (typeof toolPart.type === 'string' && toolPart.type.startsWith('tool-')) {
    return toolPart.type.slice('tool-'.length)
  }
  return 'TrackMyMoney tool'
}

function getToolOutput(toolPart: ToolPart) {
  return toolPart.result || toolPart.output
}

function getChatErrorMessage(error: unknown) {
  const fallback = 'AI could not reply. Please try again.'
  if (!error) return fallback

  const raw = error instanceof Error ? error.message : String(error)
  try {
    const parsed = JSON.parse(raw) as { error?: string; message?: string }
    return parsed.message || parsed.error || fallback
  } catch {
    return raw.trim() || fallback
  }
}

export function GlobalAiWidget() {
  const [widgetState, setWidgetState] = useState<WidgetState>('minimized')
  const [files, setFiles] = useState<File[]>([])
  const [myInput, setMyInput] = useState('')
  const [chatError, setChatError] = useState<string | null>(null)

  const chatHook = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: (error: unknown) => {
      setChatError(getChatErrorMessage(error))
      console.error("Chat error:", error)
    },
  } as Parameters<typeof useChat>[0]) as unknown as ChatHookCompat


  const { messages } = chatHook
  const isLoading = chatHook.status === 'submitted' || chatHook.status === 'streaming' || chatHook.isLoading === true

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isListening, isSupported, interimText, toggleListening } = useVoiceToText({
    onFinalTranscript: (text) => {
      setMyInput(prev => prev ? `${prev} ${text}` : text)
    }
  })


  useEffect(() => {
    if (messagesEndRef.current && widgetState !== 'minimized') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, widgetState])

  useEffect(() => {
    if (chatHook.error) {
      setChatError(getChatErrorMessage(chatHook.error))
    }
  }, [chatHook.error])


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && widgetState !== 'minimized') {
        setWidgetState('minimized')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setWidgetState(prev => prev === 'minimized' ? 'chat' : 'minimized')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [widgetState])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const safeInput = myInput || ''
    if (!safeInput.trim() && files.length === 0) return

    try {
      setChatError(null)
      chatHook.clearError?.()

      const sendMessage = chatHook.sendMessage ? chatHook.sendMessage.bind(chatHook) : null;

      if (files.length > 0) {
        try {

          const base64Images = await Promise.all(
            files.map(file => new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            }))
          )

          if (sendMessage) {
            try {
               await sendMessage(
                 { text: myInput || 'Please analyze these images.' },
                 { body: { data: { imageUrls: base64Images }, pathname: window.location.pathname } }
               )
            } catch (networkErr: unknown) {
               console.error("Network append failed on try 1:", networkErr);
               setChatError(getChatErrorMessage(networkErr))
            }
          } else {
            setChatError('AI chat is still loading. Please try again.')
          }
        } catch (err) {
          console.error("Failed to append image messages:", err)
          setChatError(getChatErrorMessage(err))
        } finally {
          setMyInput('')
          setFiles([])
        }
      } else {
        if (sendMessage) {
          try {
            await sendMessage(
              { text: myInput },
              { body: { pathname: window.location.pathname } }
            )
          } catch (e) {
            console.error("Append message failed:", e)
            setChatError(getChatErrorMessage(e))
          }
        } else {
          setChatError('AI chat is still loading. Please try again.')
          console.error("sendMessage is undefined!", Object.keys(chatHook))
        }
        setMyInput('')
      }
    } catch (globalErr) {
      console.error("Global chat submission error:", globalErr)
      setChatError(getChatErrorMessage(globalErr))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles].slice(0, 10))
    }
  }

  const toggleSize = () => {
    if (widgetState === 'chat') setWidgetState('expanded')
    else if (widgetState === 'expanded') setWidgetState('chat')
  }

  return (
    <div className="fixed inset-x-3 bottom-24 md:inset-x-auto md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {widgetState !== 'minimized' && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-2xl md:rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.28)] flex flex-col overflow-hidden mb-4 pointer-events-auto",
              "w-full h-[calc(100dvh-6rem)] max-h-[650px]",
              widgetState === 'expanded' ? "max-w-[800px] md:h-[80vh]" : "max-w-[400px]"
            )}
          >
            {}
            <div className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 border-b border-[var(--border-light)] bg-[var(--bg-surface)] shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[var(--accent)]" />
                <h3 className="font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--text-main)]">Ask AI Advisor</h3>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  type="button"
                  onClick={toggleSize}
                  className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)]"
                  aria-label={widgetState === 'expanded' ? 'Minimize AI advisor' : 'Expand AI advisor'}
                >
                  {widgetState === 'expanded' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setWidgetState('minimized')}
                  className="rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)]"
                  aria-label="Close AI advisor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {}
            <div className="relative flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-3 md:p-5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-start justify-center max-w-sm mx-auto w-full">
                  <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight leading-tight">Hello,</h1>
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--accent)] mb-4 md:mb-6 tracking-tight">Nice to meet you!</h2>

                  <p className="text-[14px] md:text-[15px] text-[var(--text-main)] font-medium mb-4 md:mb-6 leading-relaxed">
                    Hello! I&apos;m <Sparkles className="w-4 h-4 text-[var(--accent)] inline mr-0.5" /> your TrackMyMoney assistant for records and actions.
                  </p>

                  <p className="text-[14px] md:text-[15px] text-[var(--text-main)] mb-2 md:mb-3">Ask me about:</p>
                  <ul className="text-[14px] md:text-[15px] text-[var(--text-muted)] space-y-2 mb-6 md:mb-8 ml-5 list-disc marker:text-[var(--accent)] w-full font-light">
                    <li>Recorded <strong className="text-[var(--text-main)] font-medium">income and expenses</strong></li>
                    <li><strong className="text-[var(--text-main)] font-medium">Budgets, subscriptions, goals, and debts</strong></li>
                    <li>Confirmed <strong className="text-[var(--text-main)] font-medium">adds and updates</strong></li>
                    <li>Month-to-month <strong className="text-[var(--text-main)] font-medium">financial changes</strong></li>
                  </ul>

                  <p className="text-[14px] md:text-[15px] text-[var(--text-main)]">Ask a question to get started.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-4 text-[14px] md:text-[15px]",
                      m.role === 'user'
                        ? "bg-[var(--text-main)] text-[var(--bg-base)] rounded-br-sm"
                        : "bg-transparent text-[var(--text-main)] pr-0"
                    )}>
                      {}
                      {m.data?.imageUrls && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {m.data.imageUrls.map((url, idx) => (
                             <Image key={idx} src={url} alt={`Uploaded ${idx}`} width={200} height={200} unoptimized className="max-w-full sm:max-w-[200px] h-auto rounded-xl border border-[var(--border-light)]" />
                          ))}
                        </div>
                      )}

                      {}
                      {m.data?.imageUrl && (
                        <Image src={m.data.imageUrl} alt="Uploaded" width={200} height={200} unoptimized className="max-w-full sm:max-w-[200px] h-auto rounded-xl mb-3 border border-[var(--border-light)]" />
                      )}

                      <div className="whitespace-pre-wrap leading-relaxed flex flex-col gap-3 font-light">
                        {}
                        {(() => {
                          const textToRender = getMessageText(m);
                          return textToRender ? <span>{textToRender}</span> : null;
                        })()}

                        {}
                        {(() => {
                          const tools = getToolParts(m);
                          return tools.map((tool, i) => (
                            <div key={tool.toolCallId || i} className="mt-1 text-xs bg-[var(--bg-base)] p-3 rounded-xl border border-[var(--border-light)]">
                              <div className="text-[var(--text-muted)] font-mono flex items-center gap-1.5 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                                Working: <span className="text-[var(--text-main)]">{getToolName(tool)}</span>
                              </div>
                              {}
                              {(tool.state === 'result' || tool.state === 'output-available' || tool.state === 'output-error' || 'result' in tool || 'output' in tool) && (
                                <div className={tool.errorText || getToolOutput(tool)?.error || getToolOutput(tool)?.ok === false || getToolOutput(tool)?.success === false ? "text-red-400 font-medium" : "text-emerald-400 font-medium"}>
                                  {tool.errorText || getToolOutput(tool)?.error || getToolOutput(tool)?.ok === false || getToolOutput(tool)?.success === false ? 'Action failed' : 'Completed'}
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {chatError && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[90%] md:max-w-[85%] rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-300">
                    {chatError}
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex w-full justify-start pl-2 py-2">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
                    <span className="text-sm text-[var(--text-muted)] font-light">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="p-2 md:p-4 bg-[var(--bg-surface)] border-t border-[var(--border-light)] shrink-0 z-10 w-full">
              {files.length > 0 && (
                 <div className="mb-3 flex flex-wrap items-center gap-2">
                   {files.map((f, idx) => (
                     <div key={idx} className="flex items-center gap-2 bg-[var(--bg-muted)] text-[var(--text-main)] text-xs py-1.5 px-3 rounded-full w-fit max-w-[200px] border border-[var(--border-light)] truncate">
                       <ImageIcon className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                       <span className="truncate">{f.name}</span>
                       <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="ml-2 hover:text-[var(--accent)]" aria-label={`Remove ${f.name}`}>
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                 </div>
              )}
              {isListening && interimText && (
                 <div className="mb-2 text-xs text-[var(--accent)] italic font-medium px-2">Listening: {interimText}...</div>
              )}

              <form onSubmit={onSubmit} className="flex flex-col gap-2">
                <div className="flex items-center bg-[var(--bg-base)] rounded-2xl border border-[var(--border-light)] focus-within:border-[var(--accent)] transition-colors p-2 gap-2 relative group">

                  {}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] rounded-full transition-colors flex-shrink-0 disabled:opacity-50"
                    aria-label="Attach image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <input
                    value={myInput}
                    onChange={(e) => setMyInput(e.target.value)}
                    placeholder="Ask or add with confirmation"
                    className="flex-1 bg-transparent text-[var(--text-main)] text-[14px] md:text-[15px] outline-none placeholder:text-[var(--text-muted)] px-1 md:px-2 min-w-0"
                    disabled={isLoading}
                  />

                  {}
                  {isSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={isLoading}
                      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all flex-shrink-0 disabled:opacity-50",
                        isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      )}
                    >
                      {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  )}

                  {}
                  <button
                    type="submit"
                    disabled={isLoading || (!(myInput || '').trim() && files.length === 0)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[var(--text-main)] hover:opacity-90 text-[var(--bg-base)] rounded-full transition-colors disabled:opacity-30 flex-shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4 mr-0.5 mt-0.5" />
                  </button>

                  <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-focus-within:border-[var(--accent)]/20 shadow-[0_0_10px_transparent] group-focus-within:shadow-[0_0_15px_rgba(255,90,31,0.12)] transition-all"></div>
                </div>

                <div className="text-center mt-0.5 md:mt-1">
                  <p className="text-[12px] md:text-[11px] text-[var(--text-muted)]">
                    Confirmed actions only. Your data stays scoped to your account. <a href="/privacy#ai-processing" className="text-[var(--accent)] hover:underline transition-colors">Learn more</a>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {widgetState === 'minimized' && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setWidgetState('chat')}
            aria-label="Open AI advisor"
            className="group relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--accent)] shadow-[0_0_30px_rgba(255,90,31,0.3)] flex items-center justify-center hover:scale-105 transition-transform overflow-hidden pointer-events-auto"
          >
            <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity">
               {}
               <AiOrb3D state="neutral" />
            </div>
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10 drop-shadow-md" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

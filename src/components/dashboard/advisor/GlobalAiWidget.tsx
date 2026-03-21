'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@ai-sdk/react'
import { Sparkles, X, Minimize2, Maximize2, Mic, MicOff, Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useVoiceToText } from '@/hooks/useVoiceToText'
import { cn } from '@/lib/utils'
import { AiOrb3D } from '@/components/3d/AiOrb3D'

type WidgetState = 'minimized' | 'chat' | 'expanded'

export function GlobalAiWidget() {
  const [widgetState, setWidgetState] = useState<WidgetState>('minimized')
  const [files, setFiles] = useState<File[]>([])
  const [myInput, setMyInput] = useState('')
  
  const chatHook = useChat({
    api: '/api/chat',
    maxSteps: 5,
    onError: (error: any) => console.error("Chat error:", error)
  } as any)

  // @ts-ignore
  const { messages, isLoading } = chatHook
  const appendMessage = (chatHook as any).append || (chatHook as any).sendMessage

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isListening, isSupported, interimText, toggleListening } = useVoiceToText({
    onFinalTranscript: (text) => {
      setMyInput(prev => prev ? `${prev} ${text}` : text)
    }
  })

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current && widgetState !== 'minimized') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, widgetState])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Hard blocking preventing submission while generating...
    
    const safeInput = myInput || ''
    if (!safeInput.trim() && files.length === 0) return

    try {
      if (files.length > 0) {
        try {
          // Read all selected files concurrently
          const base64Images = await Promise.all(
            files.map(file => new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            }))
          )
            
          if (appendMessage) {
            let submitSuccess = false;
            try {
               await appendMessage(
                 {
                   role: 'user',
                   content: myInput || 'Please analyze these images.',
                   data: { imageUrls: base64Images }
                 },
                 {
                   data: { imageUrls: base64Images }
                 }
               )
               submitSuccess = true;
            } catch (networkErr: any) {
               console.error("Network append failed on try 1:", networkErr);
               // Try fallback payload without embedding data inside message to avoid strict SDK signature checks
               try {
                 await appendMessage(
                   { role: 'user', content: myInput || 'Please analyze these images.' },
                   { data: { imageUrls: base64Images } }
                 )
                 submitSuccess = true;
               } catch (finalErr) {
                 console.error("All image append attempts failed:", finalErr);
               }
            }
          }
        } catch (err) {
          console.error("Failed to append image messages:", err)
        } finally {
          setMyInput('')
          setFiles([])
        }
      } else {
        if (appendMessage) {
          // Try passing it as an object first
          let success = false
          try {
            await appendMessage({ role: 'user', content: myInput })
            success = true
          } catch (e) {
            console.warn("Object signature failed, trying string signature...", e)
          }
          
          if (!success) {
            try {
              // Fallback if the signature is just a string
              await appendMessage(myInput)
            } catch (err) {
              console.error("Both message signatures failed:", err)
            }
          }
        } else {
          console.error("appendMessage is undefined!", Object.keys(chatHook))
        }
        setMyInput('')
      }
    } catch (globalErr) {
      console.error("Global chat submission error:", globalErr)
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
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {widgetState !== 'minimized' && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: widgetState === 'expanded' ? 'min(800px, calc(100vw - 2rem))' : 'min(400px, calc(100vw - 2rem))',
              height: widgetState === 'expanded' ? 'min(80vh, calc(100dvh - 6rem))' : 'min(650px, calc(100dvh - 6rem))',
            }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-[#0f0f0f] border border-white/10 rounded-2xl md:rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f0f0f]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h3 className="font-semibold text-white tracking-wide text-[16px]">Ask AI Advisor</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-white/10 rounded-full text-gray-300 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                <button onClick={toggleSize} className="p-1 hover:bg-white/10 rounded-full text-gray-300 transition-colors">
                  {widgetState === 'expanded' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setWidgetState('minimized')} className="p-1 hover:bg-white/10 rounded-full text-gray-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-start justify-center max-w-sm mx-auto w-full">
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">Hello,</h1>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4 md:mb-6 tracking-tight">Nice to meet you!</h2>
                  
                  <p className="text-[14px] md:text-[15px] text-gray-100 font-medium mb-4 md:mb-6 leading-relaxed">
                    Hello! I'm <Sparkles className="w-4 h-4 text-orange-300 inline mr-0.5" /> AI Advisor, your financial partner.
                  </p>
                  
                  <p className="text-[14px] md:text-[15px] text-gray-100 mb-2 md:mb-3">I can help you with:</p>
                  <ul className="text-[14px] md:text-[15px] text-gray-300 space-y-2 mb-6 md:mb-8 ml-5 list-disc marker:text-gray-100 w-full font-light">
                    <li>Adding & tracking <strong className="text-white font-medium">transactions</strong></li>
                    <li>Managing your <strong className="text-white font-medium">subscriptions</strong></li>
                    <li>Setting new <strong className="text-white font-medium">budgets and goals</strong></li>
                    <li><strong className="text-white font-medium">Insights and info</strong> about your finances</li>
                  </ul>
                  
                  <p className="text-[14px] md:text-[15px] text-gray-100">Ask a question to get started.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-4 text-[14px] md:text-[15px]",
                      m.role === 'user' 
                        ? "bg-[#272727] text-white rounded-br-sm" 
                        : "bg-transparent text-gray-100 pr-0"
                    )}>
                      {/* Render Multiple Image Data if attached as user */}
                      {(m as any).data?.imageUrls && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(m as any).data.imageUrls.map((url: string, idx: number) => (
                             <img key={idx} src={url} alt={`Uploaded ${idx}`} className="max-w-full sm:max-w-[200px] h-auto rounded-xl border border-white/10" />
                          ))}
                        </div>
                      )}
                      
                      {/* Old single image fallback */}
                      {(m as any).data?.imageUrl && (
                        <img src={(m as any).data.imageUrl} alt="Uploaded" className="max-w-full sm:max-w-[200px] h-auto rounded-xl mb-3 border border-white/10" />
                      )}
                      
                      <div className="whitespace-pre-wrap leading-relaxed flex flex-col gap-3 font-light">
                        {/* 1. Safely render the assistant's natural language reply FIRST */}
                        {(() => {
                          let textToRender = '';
                          if (typeof (m as any).content === 'string') {
                            textToRender = (m as any).content;
                          } else if (Array.isArray((m as any).content)) {
                            textToRender = (m as any).content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
                          } else if (Array.isArray((m as any).parts)) {
                            textToRender = (m as any).parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
                          }
                          return textToRender ? <span>{textToRender}</span> : null;
                        })()}

                        {/* 2. Render discrete tool invocations as technical logs beneath the text */}
                        {(() => {
                          let tools: any[] = (m as any).toolInvocations || [];
                          if (tools.length === 0 && Array.isArray((m as any).parts)) {
                            tools = (m as any).parts.filter((p: any) => p.type === 'tool-invocation');
                          }
                          return tools.map((tool: any, i: number) => (
                            <div key={tool.toolCallId || i} className="mt-1 text-xs bg-[#1f1f1f] p-3 rounded-xl border border-white/5">
                              <div className="text-gray-400 font-mono flex items-center gap-1.5 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-pink-400/70" />
                                Working: <span className="text-gray-300">{tool.toolName}</span>
                              </div>
                              {/* Safely check for the tool roundtrip result */}
                              {(tool.state === 'result' || 'result' in tool) && (
                                <div className={tool.result?.error || tool.result?.success === false ? "text-red-400 font-medium" : "text-emerald-400 font-medium"}>
                                  {tool.result?.error || tool.result?.success === false ? "✖ Action Failed" : "✔ Successfully Completed"}
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
              {isLoading && (
                <div className="flex w-full justify-start pl-2 py-2">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
                    <span className="text-sm text-gray-400 font-light">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-[#0f0f0f] border-t border-white/5">
              {files.length > 0 && (
                 <div className="mb-3 flex flex-wrap items-center gap-2">
                   {files.map((f, idx) => (
                     <div key={idx} className="flex items-center gap-2 bg-[#272727] text-white text-xs py-1.5 px-3 rounded-full w-fit max-w-[200px] border border-white/10 truncate">
                       <ImageIcon className="w-3 h-3 text-pink-400 flex-shrink-0" />
                       <span className="truncate">{f.name}</span>
                       <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="ml-2 hover:text-pink-300">
                         <X className="w-3 h-3" />
                       </button>
                     </div>
                   ))}
                 </div>
              )}
              {isListening && interimText && (
                 <div className="mb-2 text-xs text-pink-400 italic font-medium px-2">Listening: {interimText}...</div>
              )}
              
              <form onSubmit={onSubmit} className="flex flex-col gap-2">
                <div className="flex items-center bg-transparent rounded-2xl border border-white/10 focus-within:border-pink-500/50 transition-colors p-2 gap-2 relative group">
                  
                  {/* Plus Icon Button (File Upload) */}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#272727] hover:bg-[#333] text-gray-200 rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:hover:bg-[#272727]"
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
                  
                  {/* Main Input Text */}
                  <input
                    value={myInput}
                    onChange={(e) => setMyInput(e.target.value)}
                    placeholder="Ask something"
                    className="flex-1 bg-transparent text-white text-[14px] md:text-[15px] outline-none placeholder:text-gray-500 px-1 md:px-2 min-w-0"
                    disabled={isLoading}
                  />

                  {/* Mic Button */}
                  {isSupported && (
                    <button 
                      type="button" 
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={cn(
                        "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all flex-shrink-0 disabled:opacity-50",
                        isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-transparent text-gray-500 hover:text-white"
                      )}
                    >
                      {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  )}
                  
                  {/* Send Button */}
                  <button 
                    type="submit" 
                    disabled={isLoading || (!(myInput || '').trim() && files.length === 0)}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#272727] hover:bg-[#333] text-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-[#272727] flex-shrink-0"
                  >
                    <Send className="w-3 h-3 md:w-4 md:h-4 mr-0.5 mt-0.5" />
                  </button>

                  <div className="absolute inset-0 rounded-2xl pointer-events-none border border-transparent group-focus-within:border-pink-500/20 shadow-[0_0_10px_transparent] group-focus-within:shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all"></div>
                </div>

                <div className="text-center mt-1">
                  <p className="text-[11px] text-gray-500">
                    AI can make mistakes, so double-check it. <a href="#" className="text-blue-400 hover:underline hover:text-blue-300 transition-colors">Learn more</a>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb State */}
      <AnimatePresence>
        {widgetState === 'minimized' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setWidgetState('chat')}
            className="group relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 shadow-[0_0_30px_rgba(236,72,153,0.3)] flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
          >
            <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity">
               {/* Tiny 3D orb inside the button */}
               <AiOrb3D state="neutral" />
            </div>
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10 drop-shadow-md" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

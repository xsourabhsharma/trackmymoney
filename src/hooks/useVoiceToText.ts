'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export function useVoiceToText({ onFinalTranscript }: { onFinalTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let currentInterim = ''
          let currentFinal = ''
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentFinal += event.results[i][0].transcript
            } else {
              currentInterim += event.results[i][0].transcript
            }
          }

          setInterimText(currentInterim)
          if (currentFinal) {
            onFinalTranscript(currentFinal.trim())
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          setInterimText('')
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('[SpeechRecognition] Error: ', event.error)
          setIsListening(false)
          setInterimText('')
        }
      } else {
        setIsSupported(false)
      }
    }
  }, [onFinalTranscript])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start speech recognition', e)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimText('')
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (isListening) stopListening()
    else startListening()
  }, [isListening, startListening, stopListening])

  return { isListening, isSupported, interimText, startListening, stopListening, toggleListening }
}

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionResultListLike {
  length: number
  [index: number]: SpeechRecognitionResultLike
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultListLike
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
}

export function useVoiceToText({ onFinalTranscript }: { onFinalTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const isSupported = typeof window === 'undefined' ? true : Boolean(getSpeechRecognitionConstructor())

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) return

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true

    let lastProcessedIndex = 0;

    recognitionRef.current.onstart = () => {
      lastProcessedIndex = 0;
    }

    recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
      let currentInterim = ''

      for (let i = lastProcessedIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          onFinalTranscript(event.results[i][0].transcript.trim())
          lastProcessedIndex = i + 1;
        } else {
          currentInterim += event.results[i][0].transcript
        }
      }

      setInterimText(currentInterim)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error('[SpeechRecognition] Error: ', event.error)
      setIsListening(false)
      setInterimText('')
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

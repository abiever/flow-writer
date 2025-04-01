import { useState, useEffect, useRef } from 'react'
import './App.css'
import { FlowLine } from './components/FlowLine'
import TiptapEditor from './components/TiptapEditor'
import FormattingMenu from './components/FormattingMenu'

function App() {
  const [content, setContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [flowState, setFlowState] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const lastContentLengthRef = useRef<number>(0)
  const decayIntervalRef = useRef<ReturnType<typeof setInterval>>()
  const editorRef = useRef<any>(null)

  const handleTypingStart = () => {
    setIsTyping(true)
    // Clear any existing decay interval
    if (decayIntervalRef.current) {
      clearInterval(decayIntervalRef.current)
    }
    // Don't reset flow state, just let it continue from current value
  }

  const handleTypingEnd = () => {
    setIsTyping(false)
    // Set up a smooth decay interval
    if (decayIntervalRef.current) {
      clearInterval(decayIntervalRef.current)
    }
    decayIntervalRef.current = setInterval(() => {
      setFlowState(prev => {
        const newState = Math.max(0, prev - 0.002) // Slower decay rate
        if (newState === 0) {
          clearInterval(decayIntervalRef.current)
        }
        return newState
      })
    }, 50) // Update every 50ms for smooth decay
  }

  // Update flow state based on typing speed
  useEffect(() => {
    if (isTyping) {
      const currentLength = content.length
      const lengthDiff = currentLength - lastContentLengthRef.current
      lastContentLengthRef.current = currentLength

      if (lengthDiff > 0) {
        // Calculate new flow state based on typing speed
        const typingSpeed = Math.min(1, lengthDiff / 10) // Adjust this divisor to change sensitivity
        setFlowState(prev => Math.min(1, prev + typingSpeed * 0.05)) // Slower increase rate
      }
    }
  }, [content, isTyping])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current)
      }
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="app-header">
        <h1>Flow Writer</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
      <div className="flow-container">
        <FlowLine flowState={flowState} />
      </div>
      <div className="formatting-container">
        <FormattingMenu editor={editorRef.current} />
      </div>
      <div className="editor-wrapper">
        <TiptapEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          placeholder="Start writing to enter your flow state..."
          onTypingStart={handleTypingStart}
          onTypingEnd={handleTypingEnd}
        />
      </div>
    </div>
  )
}

export default App

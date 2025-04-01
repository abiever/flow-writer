import { useState, useEffect, useRef } from 'react'
import { FlowLine } from './components/FlowLine'
import { WritingArea } from './components/WritingArea'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [flowState, setFlowState] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const lastTypingTime = useRef(Date.now())

  useEffect(() => {
    const checkTypingStatus = () => {
      const now = Date.now()
      const timeSinceLastType = now - lastTypingTime.current
      
      if (timeSinceLastType > 1000) { // If no typing for 1 second
        setIsTyping(false)
        // Decay flow state
        setFlowState(prev => Math.max(0, prev - 0.01))
      }
    }

    const interval = setInterval(checkTypingStatus, 100)
    return () => clearInterval(interval)
  }, [])

  const handleTextChange = (newText: string) => {
    setText(newText)
    setIsTyping(true)
    lastTypingTime.current = Date.now()
    
    // Calculate flow state based on typing speed
    const typingSpeed = newText.length / 100 // Normalize to 0-1 range
    setFlowState(Math.min(1, typingSpeed))
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <h1>Wave Writer</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>
      <div className="flow-container">
        <FlowLine flowState={flowState} />
      </div>
      <WritingArea
        value={text}
        onChange={handleTextChange}
        placeholder="Start writing to enter your flow state..."
      />
    </div>
  )
}

export default App

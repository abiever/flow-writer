import { useState } from 'react'
import { useFlowState } from './hooks/useFlowState'
import { FlowLine } from './components/FlowLine'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const { flowState, handleKeyPress } = useFlowState()

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    handleKeyPress()
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Flow Writer</h1>
      </header>
      <div className="flow-container">
        <FlowLine flowState={flowState} />
      </div>
      <main className="writing-area">
        <textarea
          className="writer-input"
          value={text}
          onChange={handleTextChange}
          placeholder="Start writing to enter your flow state..."
          spellCheck="false"
        />
      </main>
    </div>
  )
}

export default App

import { useEditor, EditorContent, Extension, Mark } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onTypingStart?: () => void
  onTypingEnd?: () => void
  isDarkMode: boolean
  onThemeToggle: () => void
  onWordCountChange?: (count: number) => void
}

const TabIndentation = Extension.create({
  name: 'tabIndentation',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        editor.commands.insertContent('\t')
        return true
      }
    }
  },
})

// Create a custom mark for the glow effect
const GlowMark = Mark.create({
  name: 'glow',
  renderHTML() {
    return ['span', { class: 'word-glow' }, 0]
  },
  parseHTML() {
    return [
      {
        tag: 'span[class="word-glow"]'
      }
    ]
  }
})

const TiptapEditor = forwardRef(({ 
  value, 
  onChange, 
  placeholder,
  onTypingStart,
  onTypingEnd,
  onWordCountChange
}: TiptapEditorProps, ref) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastTypingTimeRef = useRef<number>(Date.now())
  const lastContentLengthRef = useRef<number>(0)
  const editorRef = useRef<HTMLDivElement>(null)
  const shouldCenterCursorRef = useRef<boolean>(false)
  const lastMilestoneRef = useRef<number>(0)

  const checkWordMilestone = (count: number) => {
    const milestone = 100 // Every 100 words
    const currentMilestone = Math.floor(count / milestone)
    
    if (currentMilestone > lastMilestoneRef.current) {
      lastMilestoneRef.current = currentMilestone
      return true
    }
    return false
  }

  const applyGlowToLastWord = () => {
    if (!editor) return

    const { state } = editor
    const { selection } = state
    const { from } = selection

    // Save the current cursor position
    const savedCursorPos = from

    // Find the start of the last word
    let wordStart = from
    while (wordStart > 0 && !/\s/.test(state.doc.textBetween(wordStart - 1, wordStart))) {
      wordStart--
    }

    // Find the end of the last word
    let wordEnd = from
    while (wordEnd < state.doc.content.size && !/\s/.test(state.doc.textBetween(wordEnd, wordEnd + 1))) {
      wordEnd++
    }

    // Apply the glow effect
    editor.commands.setTextSelection({ from: wordStart, to: wordEnd })
    editor.commands.setMark('glow')

    // Immediately restore the cursor position
    editor.commands.setTextSelection({ from: savedCursorPos, to: savedCursorPos })

    // Remove the glow effect after animation
    setTimeout(() => {
      // Simply remove the glow mark from the current selection
      editor.commands.unsetMark('glow')
    }, 2000)
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      TabIndentation,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount,
      GlowMark,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'writing-area',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)

      // Update word count
      const count = editor.storage.characterCount.words()
      onWordCountChange?.(count)

      // Check for word count milestone
      if (checkWordMilestone(count)) {
        applyGlowToLastWord()
      }

      // Calculate typing speed
      const currentLength = html.length
      const timeDiff = Date.now() - lastTypingTimeRef.current
      const lengthDiff = currentLength - lastContentLengthRef.current
      
      // Update refs
      lastTypingTimeRef.current = Date.now()
      lastContentLengthRef.current = currentLength

      // Handle typing events
      if (lengthDiff > 0) {
        // Trigger typing start if needed
        if (timeDiff > 1000) {
          onTypingStart?.()
          // Scroll the editor into view when typing begins
          if (editorRef.current) {
            editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout for typing end
        typingTimeoutRef.current = setTimeout(() => {
          onTypingEnd?.()
        }, 1000)

        // Handle cursor visibility
        if (editorRef.current) {
          const editorElement = editorRef.current
          const { clientHeight, scrollTop } = editorElement
          const cursorPosition = editor.view.coordsAtPos(editor.state.selection.from)
          const cursorTop = cursorPosition.top
          const cursorBottom = cursorPosition.bottom
          const viewportBottom = scrollTop + clientHeight
          const viewportMiddle = scrollTop + (clientHeight / 2)
          
          // Check if cursor is at the end of the content
          const isAtEnd = editor.state.selection.from === editor.state.doc.content.size
          
          // Determine if we should center the cursor based on content length
          if (currentLength > 1000 && !shouldCenterCursorRef.current) {
            shouldCenterCursorRef.current = true
          }
          
          if (shouldCenterCursorRef.current) {
            // Keep cursor in the middle of the viewport
            const distanceFromMiddle = cursorTop - viewportMiddle
            if (Math.abs(distanceFromMiddle) > 50) {
              editorElement.scrollTop += distanceFromMiddle
            }
          } else {
            // Initial behavior: keep cursor visible at the bottom
            if (isAtEnd && cursorBottom > viewportBottom) {
              editorElement.scrollTop += (cursorBottom - viewportBottom)
            }
            // If cursor is partially hidden at the bottom, adjust to show it
            else if (cursorBottom > viewportBottom) {
              editorElement.scrollTop += (cursorBottom - viewportBottom)
            }
            // If cursor is partially hidden at the top, adjust to show it
            else if (cursorTop < scrollTop) {
              editorElement.scrollTop = cursorTop
            }
          }
        }
      }
    },
  })

  // Expose the editor instance through the ref
  useImperativeHandle(ref, () => editor, [editor])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="editor-container">
      <div ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

export default TiptapEditor 
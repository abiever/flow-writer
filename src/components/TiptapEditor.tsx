import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onTypingStart?: () => void
  onTypingEnd?: () => void
}

const TabIndentation = Extension.create({
  name: 'tabIndentation',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        editor.commands.insertContent('\t')
        return true
      },
      'Shift-Tab': ({ editor }) => {
        // Optional: handle shift+tab to remove indentation
        return true
      },
    }
  },
})

const TiptapEditor = ({ 
  value, 
  onChange, 
  placeholder,
  onTypingStart,
  onTypingEnd
}: TiptapEditorProps) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastTypingTimeRef = useRef<number>(Date.now())
  const lastContentLengthRef = useRef<number>(0)
  const editorRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastScrollPositionRef = useRef<number>(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      TabIndentation,
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
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout for typing end
        typingTimeoutRef.current = setTimeout(() => {
          onTypingEnd?.()
        }, 1000)

        // Handle scrolling
        if (editorRef.current) {
          // Clear any existing scroll timeout
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
          }

          // Set a small delay to ensure the content is rendered
          scrollTimeoutRef.current = setTimeout(() => {
            const editorElement = editorRef.current
            if (editorElement) {
              const { scrollHeight, clientHeight, scrollTop } = editorElement
              const maxScroll = scrollHeight - clientHeight
              
              // Check if cursor is at the end of the content
              const { from } = editor.state.selection
              const isAtEnd = from === editor.state.doc.content.size
              
              // Only scroll if we're at the end of the content
              if (isAtEnd) {
                // Smooth scroll to the bottom
                editorElement.scrollTo({
                  top: maxScroll,
                  behavior: 'smooth'
                })
              }
              
              lastScrollPositionRef.current = scrollTop
            }
          }, 50)
        }
      }
    },
  })

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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
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
}

export default TiptapEditor 
import { useEditor, EditorContent } from '@tiptap/react'
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

const TiptapEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Start writing...',
  onTypingStart,
  onTypingEnd
}: TiptapEditorProps) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastTypingTimeRef = useRef<number>(Date.now())
  const lastContentLengthRef = useRef<number>(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
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
      }
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <EditorContent editor={editor} />
  )
}

export default TiptapEditor 
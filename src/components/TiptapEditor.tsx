import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import FormattingMenu from './FormattingMenu'

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

const TiptapEditor = forwardRef(({ 
  value, 
  onChange, 
  placeholder,
  onTypingStart,
  onTypingEnd,
  isDarkMode,
  onThemeToggle,
  onWordCountChange
}: TiptapEditorProps, ref) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const lastTypingTimeRef = useRef<number>(Date.now())
  const lastContentLengthRef = useRef<number>(0)
  const editorRef = useRef<HTMLDivElement>(null)
  const shouldCenterCursorRef = useRef<boolean>(false)
  const [wordCount, setWordCount] = useState(0)

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
      setWordCount(count)
      onWordCountChange?.(count)

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
      <FormattingMenu 
        editor={editor} 
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        wordCount={wordCount}
      />
    </div>
  )
})

export default TiptapEditor 
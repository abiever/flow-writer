import { Editor } from '@tiptap/react'

interface FormattingMenuProps {
  editor: Editor | null
}

const FormattingMenu = ({ editor }: FormattingMenuProps) => {
  return (
    <div className="formatting-menu">
      <button
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={editor?.isActive('bold') ? 'is-active' : ''}
        disabled={!editor}
      >
        Bold
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={editor?.isActive('italic') ? 'is-active' : ''}
        disabled={!editor}
      >
        Italic
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        disabled={!editor}
      >
        H1
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        disabled={!editor}
      >
        H2
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={editor?.isActive('bulletList') ? 'is-active' : ''}
        disabled={!editor}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={editor?.isActive('orderedList') ? 'is-active' : ''}
        disabled={!editor}
      >
        Numbered List
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        className={editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        disabled={!editor}
      >
        Left
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        className={editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        disabled={!editor}
      >
        Center
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        className={editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        disabled={!editor}
      >
        Right
      </button>
    </div>
  )
}

export default FormattingMenu 
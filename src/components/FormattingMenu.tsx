import { Editor } from '@tiptap/react'
import BoldIcon from 'remixicon-react/BoldIcon'
import ItalicIcon from 'remixicon-react/ItalicIcon'
import Heading1Icon from 'remixicon-react/h1Icon'
import Heading2Icon from 'remixicon-react/h2Icon'
import ListCheckIcon from 'remixicon-react/ListCheckIcon'
import ListOrderedIcon from 'remixicon-react/ListOrderedIcon'
import AlignLeftIcon from 'remixicon-react/AlignLeftIcon'
import AlignCenterIcon from 'remixicon-react/AlignCenterIcon'
import AlignRightIcon from 'remixicon-react/AlignRightIcon'

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
        title="Bold"
      >
        <BoldIcon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={editor?.isActive('italic') ? 'is-active' : ''}
        disabled={!editor}
        title="Italic"
      >
        <ItalicIcon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        disabled={!editor}
        title="Heading 1"
      >
        <Heading1Icon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        disabled={!editor}
        title="Heading 2"
      >
        <Heading2Icon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={editor?.isActive('bulletList') ? 'is-active' : ''}
        disabled={!editor}
        title="Bullet List"
      >
        <ListCheckIcon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={editor?.isActive('orderedList') ? 'is-active' : ''}
        disabled={!editor}
        title="Numbered List"
      >
        <ListOrderedIcon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        className={editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        disabled={!editor}
        title="Align Left"
      >
        <AlignLeftIcon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        className={editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        disabled={!editor}
        title="Align Center"
      >
        <AlignCenterIcon size={20} />
      </button>
      <button
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        className={editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        disabled={!editor}
        title="Align Right"
      >
        <AlignRightIcon size={20} />
      </button>
    </div>
  )
}

export default FormattingMenu 
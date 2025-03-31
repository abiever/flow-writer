import { useEffect, useRef } from 'react';

interface WritingAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const WritingArea = ({ value, onChange, placeholder = "Start writing to enter your flow state..." }: WritingAreaProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Update content when value prop changes
    if (editor.innerText !== value) {
      editor.innerText = value;
    }

    // Handle paste events to maintain formatting
    editor.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });

    // Handle keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
      // Tab key
      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('insertText', false, '    ');
      }
      
      // Enter key (new paragraph)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
      }
    });

    return () => {
      editor.removeEventListener('paste', () => {});
      editor.removeEventListener('keydown', () => {});
    };
  }, [value]);

  const handleInput = () => {
    const editor = editorRef.current;
    if (editor) {
      onChange(editor.innerText);
    }
  };

  return (
    <div 
      ref={editorRef}
      className="writing-area"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      data-placeholder={placeholder}
    />
  );
}; 
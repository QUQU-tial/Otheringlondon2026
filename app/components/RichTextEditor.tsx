"use client";

import { useRef, useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  rows = 6,
  required = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  useEffect(() => {
    const text = editorRef.current?.innerText || '';
    setCharacterCount(text.length);
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      const text = editorRef.current.innerText || '';
      setCharacterCount(text.length);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="flex flex-col gap-[8px]">
      {/* Toolbar */}
      <div className="flex gap-[4px] border border-black/20 rounded-[2px] p-[4px] bg-white">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-[8px] py-[4px] border border-black/20 hover:bg-black/5 text-black font-bold"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: '14px',
            lineHeight: '20px'
          }}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-[8px] py-[4px] border border-black/20 hover:bg-black/5 text-black italic"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: '14px',
            lineHeight: '20px'
          }}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-[8px] py-[4px] border border-black/20 hover:bg-black/5 text-black underline"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: '14px',
            lineHeight: '20px'
          }}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="px-[8px] py-[4px] border border-black/20 hover:bg-black/5 text-black"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: '14px',
            lineHeight: '20px'
          }}
          title="Insert Link"
        >
          Link
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="w-full min-h-[180px] px-[12px] py-[8px] border border-black/20 bg-white text-black rounded-[2px] rich-text-editor"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: '16px',
          lineHeight: '24px',
          outline: 'none',
        }}
        suppressContentEditableWarning
      />

      {/* Character count */}
      <p
        className="text-black/70 text-right"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: '12px',
          lineHeight: '16px'
        }}
      >
        {characterCount} characters
      </p>

      {/* Hidden input for form validation */}
      <input
        type="hidden"
        value={editorRef.current?.innerText || ''}
        required={required}
      />
    </div>
  );
}


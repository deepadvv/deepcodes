'use client';
import { useCodeEditorStore } from '@/store/useCodeEditorStore';
import { useEffect, useState } from 'react';
import { defineMonacoThemes, LANGUAGE_CONFIG } from '../_constants';
import { Editor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RotateCcwIcon, ShareIcon, TypeIcon } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { EditorPanelSkeleton } from './EditorPanelSkeleton';
import useMounted from '@/hooks/useMounted';
import ShareSnippetDialog from './ShareSnippetDialog';
import { useRouter } from 'next/navigation';

function EditorPanel() {
  const clerk = useClerk();
  const router = useRouter();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    language,
    theme,
    fontSize,
    editor,
    setFontSize,
    setEditor,
    input,
    setInput,
  } = useCodeEditorStore();

  const mounted = useMounted();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(newCode);
  }, [language, editor]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('editor-font-size');
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem('editor-font-size', size.toString());
  };

  // Robust select all: always directly select all text
  const handleSelectAll = () => {
    const ed = editor || (window as any).monacoEditor;
    if (!ed) {
      console.warn('[SelectAll] editor not ready yet');
      return;
    }
    const model = ed.getModel();
    if (!model) return;
    try {
      // Always use robust fallback
      const endLine = model.getLineCount();
      const endCol = model.getLineMaxColumn(endLine);
      ed.setSelection({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: endLine,
        endColumn: endCol,
      });
      ed.focus();
    } catch (err) {
      console.warn('SelectAll fallback failed', err);
    }
  };

  // Format code (unchanged)
  const handleFormatCode = async () => {
    const ed = editor || (window as any).monacoEditor;
    if (ed) {
      await ed.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Word wrap toggle (unchanged handler - used in mobile only)
  const handleToggleWordWrap = () => {
    const ed = editor || (window as any).monacoEditor;
    if (ed) {
      const current = ed.getRawOptions().wordWrap;
      ed.updateOptions({ wordWrap: current === 'on' ? 'off' : 'on' });
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={'/' + language + '.png'}
                alt="Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-sm hidden lg:block font-medium text-white">
                Code Editor
              </h2>
              <p className="hidden lg:block text-xs text-gray-500">
                Write and execute your code
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>
            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
                from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShareIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white">Share</span>
            </motion.button>
          </div>
        </div>
        {/* Editor */}
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded ? (
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor, monaco) => {
                setEditor(editor);
                (window as any).monacoEditor = editor;
                console.log('[Monaco Mounted]', editor);
                // Add Select All only
                editor.addAction({
                  id: 'select-all',
                  label: 'Select All',
                  contextMenuGroupId: 'navigation',
                  contextMenuOrder: 1.5,
                  run: () => handleSelectAll(),
                });
                // DO NOT add toggle-word-wrap
                // Add Format only
                editor.addAction({
                  id: 'format-document',
                  label: 'Format Document',
                  contextMenuGroupId: '1_modification',
                  contextMenuOrder: 2,
                  run: () => handleFormatCode(),
                });
              }}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: 'selection',
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: 'all',
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                wordWrap: 'on',
              }}
            />
          ) : (
            <EditorPanelSkeleton />
          )}
        </div>
        {/* Input Panel */}
        <div className="mt-6">
          <label
            htmlFor="inputPanel"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Inputs
          </label>
          <textarea
            id="inputPanel"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Inputs here (separated by lines if 1+)."
            className="w-full rounded-md bg-[#1e1e2e] border border-white/[0.05] text-white p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* Mobile Toolbar */}
     
      {/* Share Dialog */}
      {isShareDialogOpen && (
        <ShareSnippetDialog
          onClose={() => setIsShareDialogOpen(false)}
          onSuccess={() => {
            setIsShareDialogOpen(false);
            router.push('/snippets');
          }}
        />
      )}
    </div>
  );
}

export default EditorPanel;


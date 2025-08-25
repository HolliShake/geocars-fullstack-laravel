import React, { forwardRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Types for the component props
export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  modules?: Record<string, unknown>;
  formats?: string[];
  theme?: 'snow' | 'bubble';
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  toolbar?: boolean | unknown[];
  showToolbar?: boolean;
  showStatusBar?: boolean;
  preserveWhitespace?: boolean;
  scrollingContainer?: string;
  bounds?: string | HTMLElement;
  onFocus?: (range: unknown, source: unknown, editor: unknown) => void;
  onBlur?: (previousRange: unknown, source: unknown, editor: unknown) => void;
  onEditorChange?: (html: string, delta: unknown, source: unknown, editor: unknown) => void;
}

// Default modules configuration
const defaultModules: Record<string, unknown> = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

// Default formats - fixed duplicates and removed invalid 'bullet' format
const defaultFormats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'script',
  'blockquote',
  'code-block',
  'list',
  'indent',
  'direction',
  'align',
  'link',
  'image',
  'video',
];

export const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  (
    {
      value = '',
      onChange,
      placeholder = 'Start writing...',
      readOnly = false,
      disabled = false,
      className = '',
      style,
      modules,
      formats,
      theme = 'snow',
      height,
      minHeight = '200px',
      maxHeight,
      toolbar = true,
      showToolbar = true,
      showStatusBar = false,
      preserveWhitespace = false,
      bounds,
      onFocus,
      onBlur,
      onEditorChange,
      ...props
    },
    ref
  ) => {
    // Memoize modules configuration
    const quillModules = useMemo(() => {
      if (modules) return modules;

      const baseModules = { ...defaultModules };

      // Hide toolbar if not needed
      if (!showToolbar) {
        delete baseModules.toolbar;
      } else if (Array.isArray(toolbar)) {
        baseModules.toolbar = toolbar;
      }

      return baseModules;
    }, [modules, showToolbar, toolbar]);

    // Memoize formats
    const quillFormats = useMemo(() => {
      return formats || defaultFormats;
    }, [formats]);

    // Handle content change
    const handleChange = (content: string, delta: unknown, source: unknown, editor: unknown) => {
      if (onChange) {
        onChange(content);
      }
      if (onEditorChange) {
        onEditorChange(content, delta, source, editor);
      }
    };

    // Custom styles for the editor
    const editorStyle = useMemo(() => {
      const baseStyle: React.CSSProperties = {
        minHeight,
        ...style,
      };

      if (height) {
        baseStyle.height = height;
      }

      if (maxHeight) {
        baseStyle.maxHeight = maxHeight;
      }

      if (preserveWhitespace) {
        baseStyle.whiteSpace = 'pre-wrap';
      }

      return baseStyle;
    }, [height, minHeight, maxHeight, preserveWhitespace, style]);

    return (
      <div className={`rich-text-editor ${className}`}>
        <ReactQuill
          ref={ref}
          theme={theme}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly || disabled}
          modules={quillModules}
          formats={quillFormats}
          style={editorStyle}
          bounds={bounds}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />

        {/* Status bar */}
        {showStatusBar && (
          <div className="quill-status-bar">
            <span className="quill-status-text">{value.length} characters</span>
          </div>
        )}
      </div>
    );
  }
);

// Add display name for better debugging
RichTextEditor.displayName = 'RichTextEditor';

// Export default
export default RichTextEditor;

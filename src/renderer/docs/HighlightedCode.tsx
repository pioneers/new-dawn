import { useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import './HighlightedCode.css';

/**
 * Uses a read-only AceEditor to display a code block with Python syntax highlighting. The only
 * valid children of this component is text containing the code to be displayed. Common indentation
 * is removed from each line of code before display. Only spaces are considered indentation; tabs,
 * half-width spaces, and nonbreaking spaces are treated as content.
 * @param props
 * @param props.indent - number of spaces of indentation to prepend to each line, after common
 * indentation is removed.
 */
export default function HighlightedCode({
  children,
  indent = 0,
}: {
  children: string;
  indent?: number;
}) {
  const cleanupRef = useRef<null | (() => void)>(null);
  const setEditorRef = (editor: AceEditor) => {
    cleanupRef.current?.();
    if (editor) {
      const callback = () => {
        editor.editor.getSession().selection.clearSelection();
      };
      editor.editor.getSession().selection.on('changeSelection', callback);
      cleanupRef.current = () => {
        editor.editor.getSession().selection.off('changeSelection', callback);
        cleanupRef.current = null;
      };
    }
  };

  const lines = children.split('\n');
  if (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  if (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }
  // Remove common indent
  const minIndent = Math.min(
    ...lines
      .filter((line) => line.trim().length)
      .map((line) => line.match(/^ */)![0].length),
  );
  const formatted = lines
    .map((line) => ' '.repeat(indent) + line.slice(minIndent))
    .join('\n');

  return (
    <AceEditor
      value={formatted}
      className="HighlightedCode-editor"
      readOnly
      showGutter={false}
      style={{ width: '100%' }}
      mode="python"
      maxLines={Infinity}
      ref={setEditorRef}
    />
  );
}
/**
 * Default props for HighlightedCode.
 */
HighlightedCode.defaultProps = {
  /**
   * No indentation is added to code lines after stripping common indentation by default.
   */
  indent: 0,
};

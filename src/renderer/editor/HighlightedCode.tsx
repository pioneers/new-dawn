import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import './HighlightedCode.css';

export default function HighlightedCode({
  children,
  indent = 0,
}: {
  children: string;
  indent: number?;
}) {
  const lines = children.split('\n');
  if (lines.length && !lines[0].trim()) {
    lines.shift();
  }
  if (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }
  // Remove common indent
  const minIndent = Math.min(...lines
    .filter(line => line.trim().length)
    .map(line => line.match(/^ */)[0].length)
  );
  const formatted = lines.map(line => ' '.repeat(indent) + line.slice(minIndent)).join('\n');
  return (
    <AceEditor
      value={formatted}
      className="HighlightedCode-editor"
      readOnly={true}
      showGutter={false}
      style={{ width: '100%' }}
      mode="python"
      maxLines={Infinity}
    />
  );
}

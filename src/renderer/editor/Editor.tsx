import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import './Editor.css';

/**
 * Component holding the Ace editor and editor toolbar.
 */
export default function Editor({ width, onChange }: {
  width: number;
  onChange: (content: string) => void
}) { 
  return (
    <div className="Editor" style={{ width: width }}>
      <AceEditor
        style={{ width: '100%', height: '100%' }}
        mode="python"
        onChange={onChange}
      />
    </div>
  );
}

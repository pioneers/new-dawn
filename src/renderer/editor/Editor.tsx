import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import './Editor.css';

const STATUS_TOOLTIPS = {
  clean: '',
  dirty:
    'Your changes will not be uploaded to the robot unless you save before running.',
  extDirty:
    'The code that will be uploaded to the robot was last changed in an external program.',
};
const STATUS_TEXT = {
  clean: '',
  dirty: 'Modified',
  extDirty: 'Externally modified',
};
/**
 * Component holding the Ace editor and editor toolbar.
 */
export default function Editor({
  width,
  onChange,
  fileStatus,
  filePath,
  content,
}: {
  width: number;
  onChange: (content: string) => void;
  fileStatus: 'clean' | 'dirty' | 'extDirty';
  filePath: string;
  content: string;
}) {
  return (
    <div className="Editor" style={{ width }}>
      <div className="Editor-file-info">
        <span className="Editor-file-name">{filePath || '[New file]'}</span>
        <span
          className="Editor-file-status"
          title={STATUS_TOOLTIPS[fileStatus]}
        >
          {STATUS_TEXT[fileStatus]}
        </span>
      </div>
      <div className="Editor-ace-wrapper">
        <AceEditor
          style={{ width: '100%', height: '100%' }}
          mode="python"
          onChange={onChange}
          value={content}
        />
      </div>
    </div>
  );
}

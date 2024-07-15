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
 * @param props - props
 * @param props.width - width in pixels of Editor container
 * @param props.fileStatus - dirty status of the currently open file
 * @param props.filePath - path of the currently open file
 * @param props.content - the content that should be displayed in the code editor
 */
export default function Editor({
  width,
  onChange,
  fileStatus,
  filePath,
  content,
}: {
  width: number;
  /**
   * change handler for the content of the code editor
   * @param content - the new content of the code editor
   */
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

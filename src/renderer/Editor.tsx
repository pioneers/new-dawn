import { useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import './Editor.css';
import uploadSvg from '../../assets/upload.svg';
import downloadSvg from '../../assets/download.svg';
import openSvg from '../../assets/open.svg';
import saveSvg from '../../assets/save.svg';
import saveAsSvg from '../../assets/saveAs.svg';
import newFileSvg from '../../assets/newFile.svg';
import consoleSvg from '../../assets/console.svg';
import consoleAlertSvg from '../../assets/consoleAlert.svg';
import consoleClearSvg from '../../assets/consoleClear.svg';
import zoomInSvg from '../../assets/zoomIn.svg';
import zoomOutSvg from '../../assets/zoomOut.svg';
import startRobot from '../../assets/startRobot.svg';
import stopRobot from '../../assets/stopRobot.svg';

/**
 * A status of the Editor's content.
 */
export type EditorContentStatus = 'clean' | 'dirty' | 'extDirty';

/**
 * Tooltips to display over the editor status indicator.
 */
const STATUS_TOOLTIPS: { [k in EditorContentStatus]: string } = {
  clean: '',
  dirty:
    'Your changes will not be uploaded to the robot unless you save before running.',
  extDirty:
    'The code that will be uploaded to the robot was last changed in an external program.',
};
/**
 * Content of the editor status indicator (next to the file name).
 */
const STATUS_TEXT: { [k in EditorContentStatus]: string } = {
  clean: '',
  dirty: 'Modified',
  extDirty: 'Externally modified',
};

/**
 * Component holding the Ace editor and editor toolbar.
 * @param props - props
 * @param props.width - width in pixels of Editor container
 * @param props.fileStatus - dirty status of the currently open file
 * @param props.filePath - path of the currently open file, or an empty string if no file is open
 * @param props.content - the content that should be displayed in the code editor
 * @param props.consoleAlert - whether to show a different icon for the toggle console button that
 * indicates the user's attention is needed
 * @param props.onOpen - handler called when the user wants to open a file in the editor
 * @param props.onNewFile - handler called when the user wants to close the current file
 * @param props.onRobotUpload - handler called when the user wants to upload the open file to the
 * robot
 * @param props.onRobotDownload - handler called when the user wants to download code from the
 * robot into the editor
 * @param props.onStopRobot - handler called when the user wants to stop code running on the robot
 * @param props.onToggleConsole - handler called when the user wants to toggle the AppConsole's
 * visibility
 * @param props.onClearConsole - handler called when the user wants to clear the AppConsole
 */
export default function Editor({
  width,
  onChange,
  fileStatus,
  filePath,
  content,
  consoleAlert,
  onOpen,
  onSave,
  onNewFile,
  onRobotUpload,
  onRobotDownload,
  onStartRobot,
  onStopRobot,
  onToggleConsole,
  onClearConsole,
  onToggleKeyboardControls,
}: {
  width: number;
  /**
   * change handler for the content of the code editor
   * @param content - the new content of the code editor
   */
  onChange: (content: string) => void;
  fileStatus: EditorContentStatus;
  filePath: string;
  content: string;
  consoleAlert: boolean;
  onOpen: () => void;
  /**
   * handler called when the user wants to save the contents of the editor
   * @param forceDialog - whether to prompt the user for a save path even if one is remembered
   */
  onSave: (forceDialog: boolean) => void;
  onNewFile: () => void;
  onRobotUpload: () => void;
  onRobotDownload: () => void;
  /**
   * handler called when the user wants to run code on the robot
   * @param opmode - the OpMode to run
   */
  onStartRobot: (opmode: 'auto' | 'teleop') => void;
  onStopRobot: () => void;
  onToggleConsole: () => void;
  onClearConsole: () => void;
  onToggleKeyboardControls: () => void;
}) {
  const [opmode, setOpmode] = useState('auto');
  const [fontSize, setFontSize] = useState(12);

  const zoomEditor = (increase: boolean) => {
    setFontSize((old) => old + (increase ? 1 : -1));
  };

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
      <div className="Editor-toolbar">
        <div className="Editor-toolbar-group">
          <button type="button" onClick={onOpen} title="Open">
            <img src={openSvg} alt="Open" />
          </button>
          <button type="button" onClick={() => onSave(false)} title="Save">
            <img src={saveSvg} alt="Save" />
          </button>
          <button type="button" onClick={() => onSave(true)} title="Save As">
            <img src={saveAsSvg} alt="Save As" />
          </button>
          <button type="button" onClick={onNewFile} title="New File">
            <img src={newFileSvg} alt="New File" />
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <button type="button" onClick={onRobotUpload} title="Upload to robot">
            <img src={uploadSvg} alt="Upload to robot" />
          </button>
          <button
            type="button"
            onClick={onRobotDownload}
            title="Download code from robot"
          >
            <img src={downloadSvg} alt="Download code from robot" />
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <button
            type="button"
            onClick={onToggleConsole}
            title="Toggle console"
          >
            <img
              src={consoleAlert ? consoleAlertSvg : consoleSvg}
              alt="Stop robot"
            />
          </button>
          <button type="button" onClick={onClearConsole} title="Clear console">
            <img src={consoleClearSvg} alt="Clear console" />
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <button
            type="button"
            onClick={() => zoomEditor(true)}
            title="Zoom in"
          >
            <img src={zoomInSvg} alt="Zoom in" />
          </button>
          <button
            type="button"
            onClick={() => zoomEditor(false)}
            title="Zoom out"
          >
            <img src={zoomOutSvg} alt="Zoom out" />
          </button>
          <button
            type="button"
            onClick={onToggleKeyboardControls}
            title="Toggle keyboard controls"
          >
            {/* icon */}
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <label className="Editor-tbopmode" htmlFor="Editor-toolbar-opmode">
            OpMode:
            <select
              onChange={(e) => setOpmode(e.target.value)}
              name="Editor-toolbar-opmode"
            >
              <option value="auto">Autonomous</option>
              <option value="teleop">Tele-Op</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => onStartRobot(opmode as 'auto' | 'teleop')}
            title="Run robot code"
          >
            <img src={startRobot} alt="Run robot code" />
          </button>
          <button type="button" onClick={onStopRobot} title="Stop robot">
            <img src={stopRobot} alt="Stop robot" />
          </button>
        </div>
      </div>
      <div className="Editor-ace-wrapper">
        <AceEditor
          fontSize={fontSize}
          style={{ width: '100%', height: '100%' }}
          mode="python"
          onChange={onChange}
          value={content}
        />
      </div>
    </div>
  );
}
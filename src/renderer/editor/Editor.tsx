import { useState, useRef } from 'react';
import AceEditor from 'react-ace';
import addEditorAutocomplete from './addEditorAutocomplete';
import addEditorTooltips from './addEditorTooltips';
import type { DocsRef } from '../docs/ApiLink';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/snippets/python';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-clouds';
import 'ace-builds/src-noconflict/theme-dawn';
import 'ace-builds/src-noconflict/theme-dreamweaver';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-ambiance';

import uploadSvg from '../../../assets/upload.svg';
import downloadSvg from '../../../assets/download.svg';
import openSvg from '../../../assets/open.svg';
import saveSvg from '../../../assets/save.svg';
import saveAsSvg from '../../../assets/save-as.svg';
import newFileSvg from '../../../assets/new-file.svg';
import pieSvg from '../../../assets/pie.svg';
import consoleSvg from '../../../assets/console.svg';
import consoleClearSvg from '../../../assets/console-clear.svg';
import zoomInSvg from '../../../assets/zoom-in.svg';
import zoomOutSvg from '../../../assets/zoom-out.svg';
import startRobot from '../../../assets/start-robot.svg';
import stopRobot from '../../../assets/stop-robot.svg';
import keyboardKeySvg from '../../../assets/keyboard-key.svg';
import themeSvg from '../../../assets/theme.svg';

import './Editor.css';

/**
 * A status of the Editor's content.
 */
export type EditorContentStatus = 'clean' | 'dirty' | 'extDirty';

/**
 * A status of keyboard controls. Would be a simple boolean if we didn't need a way to prevent
 * duplicate empty "keyboard disconnected" input objects to be sent to Runtime.
 */
export type KeyboardControlsStatus = 'off' | 'on' | 'offEdge';

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
 * Color themes for the ACE code editor.
 */
const ACE_THEMES = {
  dawn: 'Dawn',
  chrome: 'Chrome',
  clouds: 'Clouds',
  dreamweaver: 'Dreamweaver',
  monokai: 'Monokai',
  tomorrow_night: 'Tomorrow Night',
  clouds_midnight: 'Clouds Midnight',
  ambiance: 'Ambiance',
};

/**
 * Component holding the Ace editor and editor toolbar.
 * @param props - props
 * @param props.width - width in pixels of Editor container
 * @param props.fileStatus - dirty status of the currently open file
 * @param props.filePath - path of the currently open file, or an empty string if no file is open
 * @param props.content - the content that should be displayed in the code editor
 * @param props.consoleAlert - whether to show a different icon for the toggle console button
 * indicating the user's attention is needed
 * @param props.consoleIsOpen - whether to show a different icon for the toggle console button
 * indicating the console is open
 * @param props.keyboardControlsStatus - whether to show a different icon for the toggle keyboard
 * control button indicating keyboard control is enabled
 * @param props.robotConnected - whether toolbar buttons requiring a connection to the robot should
 * be enabled.
 * @param props.robotRunning - whether the robot is running, which affects whether some toolbar
 * buttons are enabled.
 * @param props.onShowHelpModal - a callback to call when the help modal should be shown.
 * @param props.onOpen - handler called when the user wants to open a file in the editor
 * @param props.onNewFile - handler called when the user wants to close the current file
 * @param props.onLoadStaffCode - handler called when the user wants to load staff code into the
 * editor
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
  consoleIsOpen,
  keyboardControlsStatus,
  robotConnected,
  robotRunning,
  docsRef,
  onShowHelpModal,
  onOpen,
  onSave,
  onNewFile,
  onLoadStaffCode,
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
  consoleIsOpen: boolean;
  keyboardControlsStatus: KeyboardControlsStatus;
  robotConnected: boolean;
  robotRunning: boolean;
  docsRef: DocsRef;
  onShowHelpModal: () => void;
  onOpen: () => void;
  /**
   * handler called when the user wants to save the contents of the editor
   * @param forceDialog - whether to prompt the user for a save path even if one is remembered
   */
  onSave: (forceDialog: boolean) => void;
  onNewFile: () => void;
  onLoadStaffCode: () => void;
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
  const editorModsCleanupRef = useRef(null);

  const zoomEditor = (increase: boolean) => {
    setFontSize((old) => old + (increase ? 1 : -1));
  };

  const setEditorRef = (editor: AceEditor) => {
    editorModsCleanupRef.current?.();
    if (editor) {
      const cleanupAutocomplete = addEditorAutocomplete(editor.editor);
      const cleanupTooltips = addEditorTooltips(editor.editor, onShowHelpModal, docsRef);
      editorModsCleanupRef.current = () => {
        cleanupAutocomplete();
        cleanupTooltips();
        editorModsCleanupRef.current = null;
      };
    }
  };

  const [theme, setTheme] = useState('dawn'); // Default theme
  const handleThemeChange = (newTheme: string) => {
    const cleanTheme = newTheme.replace('ace/theme/', '');
    setTheme(cleanTheme);
  };

  return (
    <div
      className={`Editor${
        keyboardControlsStatus === 'on' ? ' Editor-kbctrl-enabled' : ''
      }`}
      style={{ width }}
    >
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
            <img src={newFileSvg} alt="New file" />
          </button>
          <button
            type="button"
            onClick={onLoadStaffCode}
            title="Load staff code"
          >
            <img src={pieSvg} alt="Load staff code" />
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <button
            type="button"
            onClick={() => robotConnected && onRobotUpload()}
            className={robotConnected ? undefined : 'Editor-tbbtn-disabled'}
            title="Upload to robot"
          >
            <img src={uploadSvg} alt="Upload to robot" />
          </button>
          <button
            type="button"
            onClick={() => robotConnected && onRobotDownload()}
            className={robotConnected ? undefined : 'Editor-tbbtn-disabled'}
            title="Download code from robot"
          >
            <img src={downloadSvg} alt="Download code from robot" />
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <button
            type="button"
            onClick={onToggleConsole}
            className={consoleIsOpen ? 'Editor-tbbtn-toggled' : undefined}
            title="Toggle console"
          >
            {consoleAlert && <div className="Editor-tbbtn-alert" />}
            <img src={consoleSvg} alt="Stop robot" />
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
            className={
              keyboardControlsStatus === 'on'
                ? 'Editor-tbbtn-toggled'
                : undefined
            }
            title="Toggle keyboard controls"
          >
            <img src={keyboardKeySvg} alt="Toggle keyboard controls" />
          </button>
        </div>
        <div className="Editor-toolbar-group">
          <img src={themeSvg} alt="Change Theme" />
          <select
            onChange={(e) => handleThemeChange(`ace/theme/${e.target.value}`)}
            name="Editor-toolbar-opmode"
          >
            {Object.entries(ACE_THEMES).map(([themeKey, themeName]) => (
              <option key={themeKey} value={themeKey}>
                {themeName}
              </option>
            ))}
          </select>
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
            onClick={() =>
              robotConnected &&
              !robotRunning &&
              onStartRobot(opmode as 'auto' | 'teleop')
            }
            className={
              robotConnected && !robotRunning
                ? undefined
                : 'Editor-tbbtn-disabled'
            }
            title="Run robot code"
          >
            <img src={startRobot} alt="Run robot code" />
          </button>
          <button
            type="button"
            onClick={() => robotConnected && robotRunning && onStopRobot()}
            className={
              robotConnected && robotRunning
                ? undefined
                : 'Editor-tbbtn-disabled'
            }
            title="Stop robot"
          >
            <img src={stopRobot} alt="Stop robot" />
          </button>
        </div>
      </div>
      <div className="Editor-ace-wrapper">
        <div className="Editor-kbctrl-overlay">
          <span>Keyboard input sent to robot -- disable to edit code</span>
        </div>
        <AceEditor
          theme={theme}
          fontSize={fontSize}
          style={{ width: '100%', height: '100%' }}
          mode="python"
          onChange={onChange}
          value={content}
          readOnly={keyboardControlsStatus === 'on'}
          ref={setEditorRef}
          enableBasicAutocompletion
          enableLiveAutocompletion
          enableSnippets
        />
      </div>
    </div>
  );
}

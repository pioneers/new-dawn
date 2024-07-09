import { StrictMode, useState, useEffect, useLayoutEffect } from 'react';
import Topbar from './Topbar';
import Editor from './editor/Editor';
import DeviceInfo from './DeviceInfo';
import AppConsole from './AppConsole';
import ConnectionConfigModal from './modals/ConnectionConfigModal';
import GamepadInfoModal from './modals/GamepadInfoModal';
import ResizeBar from './ResizeBar';
import './App.css';

const INITIAL_EDITOR_WIDTH_PERCENT = 0.7;
const INITIAL_COLS_HEIGHT_PERCENT = 0.7;
const MAX_EDITOR_WIDTH_PERCENT = 0.9;
const MAX_COLS_HEIGHT_PERCENT = 0.7;
const MIN_EDITOR_WIDTH_PERCENT = 0.6;
const MIN_COLS_HEIGHT_PERCENT = 0.25;

/**
 * Top-level component handling layout.
 */
export default function App() {
  // Most recent window.innerWidth/Height needed to clamp editor and col size
  const [windowSize, setWindowSize] = useState([-1, -1]);
  // Current width of editor in pixels
  const [editorSize, setEditorSize] = useState(-1);
  // Width of editor before ongoing resize in pixels, -1 if no resize
  const [editorInitialSize, setEditorInitialSize] = useState(-1);
  // Current height of cols in pixels
  const [colsSize, setColsSize] = useState(-1);
  // Height of cols before ongoing resize in pixels, -1 if no resize
  const [colsInitialSize, setColsInitialSize] = useState(-1);
  // Name of active modal, empty if no modal is active
  const [activeModal, setActiveModal] = useState('');
  // Dawn version string, received from main process
  const [dawnVersion, setDawnVersion] = useState('');
  // Runtime version string, empty if disconnected from robot
  const [runtimeVersion, setRuntimeVersion] = useState('');
  // Robot battery voltage, -1 if disconnected from robot
  const [robotBatteryVoltage, setRobotBatteryVoltage] = useState(-1);
  // Robot latency, -1 if disconnected from robot
  const [robotLatencyMs, setRobotLatencyMs] = useState(-1);
  // Text content of editor
  const [editorContent, setEditorContent] = useState('');

  useLayoutEffect(() => {
    const onResize = () => {
      const newSize = [window.innerWidth, window.innerHeight];
      if (editorSize === -1) {
        setEditorSize(INITIAL_EDITOR_WIDTH_PERCENT * newSize[0]);
      } else {
        // Resize proportionally
        setEditorSize(editorSize * newSize[0] / windowSize[0]);
      }
      if (colsSize === -1) {
        setColsSize(INITIAL_COLS_HEIGHT_PERCENT * newSize[1]);
      } else {
        setColsSize(colsSize * newSize[1] / windowSize[1]);
      }
      setWindowSize(newSize);
      // Cancel any current resize
      setEditorInitialSize(-1);
      setColsInitialSize(-1);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // Tests, for example, won't run main/preload.ts
    if (window.electron) {
      window.electron.ipcRenderer.once('renderer-init', (data) => {
        setDawnVersion((data as { dawnVersion: string }).dawnVersion);
      });
      // ipcRenderer.on returns a cleanup function
      return window.electron.ipcRenderer.on('robot-connection-update', (data) => {
        const { runtimeVersion, robotBatteryVoltage, robotLatencyMs } = data as {
          runtimeVersion?: string;
          robotBatteryVoltage?: number;
          robotLatencyMs?: number
        };
        if (runtimeVersion !== undefined) {
          setRuntimeVersion(runtimeVersion);
        }
        if (robotBatteryVoltage !== undefined) {
          setRobotBatteryVoltage(robotBatteryVoltage);
        }
        if (robotLatencyMs !== undefined) {
          setRobotLatencyMs(robotLatencyMs);
        }
      });
    }
  }, []);

  // Editor ResizeBar handlers:
  const startEditorResize = () => setEditorInitialSize(editorSize);
  const updateEditorResize = (d: number) => {
    if (editorInitialSize === -1) {
      // Drop update, the window was just resized
      return false;
    }
    setEditorSize(Math.max(
      Math.min(
        editorInitialSize + d,
        MAX_EDITOR_WIDTH_PERCENT * windowSize[0]
      ),
      MIN_EDITOR_WIDTH_PERCENT * windowSize[0]
    ));
    return true;
  };
  const endEditorResize = () => setEditorInitialSize(-1);

  // Cols ResizeBar handlers:
  const startColsResize = () => setColsInitialSize(colsSize);
  const updateColsResize = (d: number) => {
    if (colsInitialSize === -1) {
      return false;
    }
    setColsSize(Math.max(
      Math.min(
        colsInitialSize + d,
        MAX_COLS_HEIGHT_PERCENT * windowSize[1]
      ),
      MIN_COLS_HEIGHT_PERCENT * windowSize[1]
    ));
    return true;
  };
  const endColsResize = () => setColsInitialSize(-1);
  
  const closeModal = () => setActiveModal('');

  return (
    <StrictMode>
      <div className="App">
        <Topbar
          onConnectionConfigModalOpen={() => setActiveModal('ConnectionConfig')}
          dawnVersion={dawnVersion}
          runtimeVersion={runtimeVersion}
          robotLatencyMs={robotLatencyMs}
          robotBatteryVoltage={robotBatteryVoltage} />
        <div className="App-cols" style={{ height: colsSize }}>
          <Editor width={editorSize} onChange={setEditorContent} />
          <ResizeBar
            onStartResize={startEditorResize}
            onUpdateResize={updateEditorResize}
            onEndResize={endEditorResize}
            axis="x" />
          <DeviceInfo />
        </div>
        <ResizeBar
          onStartResize={startColsResize}
          onUpdateResize={updateColsResize}
          onEndResize={endColsResize}
          axis="y" />
        <AppConsole />
        <div className="App-modal-container">
          <ConnectionConfigModal
            isActive={activeModal === 'ConnectionConfig'}
            onClose={closeModal} />
          <GamepadInfoModal
            isActive={activeModal === 'GamepadInfo'}
            onClose={closeModal} />
        </div>
      </div>
    </StrictMode>
  );
}

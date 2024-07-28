import {
  StrictMode,
  useState,
  useCallback,
  useReducer,
  useEffect,
  useLayoutEffect,
  ChangeEvent,
} from 'react';
import Topbar from './Topbar';
import Editor from './editor/Editor';
import DeviceInfo from './DeviceInfo';
import AppConsole from './AppConsole';
import AppConsoleMessage from '../common/AppConsoleMessage';
import ConfirmModal from './modals/ConfirmModal';
import ConnectionConfigModal from './modals/ConnectionConfigModal';
import GamepadInfoModal from './modals/GamepadInfoModal';
import ResizeBar from './ResizeBar';
import type {
  RendererInitData,
  RendererFileControlData,
  RendererPostConsoleData,
  RendererRobotUpdateData,
  MainFileControlData,
  MainQuitData,
} from '../common/IpcEventTypes';
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
  // Clean/dirty/extDirty status of edited file
  const [editorStatus, setEditorStatus] = useState(
    'clean' as 'clean' | 'dirty' | 'extDirty',
  );
  // Path to file in editor, empty if no save path
  const [editorPath, setEditorPath] = useState('');
  // AppConsoleMessages displayed in AppConsole
  const [consoleMsgs, setConsoleMsgs] = useState([] as AppConsoleMessage[]);
  // Most recent window.innerWidth/Height needed to clamp editor and col size
  const [windowSize, setWindowSize] = useReducer(
    (oldSize: [number, number], newSize: [number, number]) => {
      setEditorSize((old) => {
        if (old === -1) {
          return INITIAL_EDITOR_WIDTH_PERCENT * newSize[0];
        }
        // Resize proportionally
        return (old * newSize[0]) / oldSize[0];
      });
      setColsSize((old) => {
        if (colsSize === -1) {
          return INITIAL_COLS_HEIGHT_PERCENT * newSize[1];
        }
        return (old * newSize[1]) / oldSize[1];
      });
      // Cancel any current resize
      setEditorInitialSize(-1);
      setColsInitialSize(-1);
      return newSize;
    },
    [-1, -1],
  );

  // for the ConnectionConfigModal
  const [IPAddress, setIPAddress] = useState('192.168.0.100');
  const [SSHAddress, setSSHAddress] = useState('192.168.0.100');
  const [FieldIPAddress, setFieldIPAddress] = useState('localhost');
  const [FieldStationNum, setFieldStationNum] = useState('4');

  // Update windowSize:
  useLayoutEffect(() => {
    const onResize = () =>
      setWindowSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // Tests, for example, won't run main/preload.ts
    if (window.electron) {
      window.electron.ipcRenderer.once('renderer-init', (data) => {
        const typedData = data as RendererInitData;
        setDawnVersion(typedData.dawnVersion);
        setIPAddress(typedData.robotIPAddress);
        setSSHAddress(typedData.robotSSHAddress);
        setFieldIPAddress(typedData.fieldIPAddress);
        setFieldStationNum(typedData.fieldStationNumber);
      });
      const listenerDestructors = [
        window.electron.ipcRenderer.on('renderer-robot-update', (data) => {
          const {
            newRuntimeVersion,
            newRobotBatteryVoltage,
            newRobotLatencyMs,
          } = data as RendererRobotUpdateData;
          if (newRuntimeVersion !== undefined) {
            setRuntimeVersion(newRuntimeVersion);
          }
          if (newRobotBatteryVoltage !== undefined) {
            setRobotBatteryVoltage(newRobotBatteryVoltage);
          }
          if (newRobotLatencyMs !== undefined) {
            setRobotLatencyMs(newRobotLatencyMs);
          }
        }),
        window.electron.ipcRenderer.on('renderer-post-console', (data) => {
          setConsoleMsgs((old) => [...old, data as RendererPostConsoleData]);
        }),
      ];
      return () => listenerDestructors.forEach((destructor) => destructor());
    }
    return () => {};
  }, []);

  const closeWindow = useCallback(() => {
    const data: MainQuitData = {
      robotIPAddress: IPAddress,
      robotSSHAddress: SSHAddress,
      fieldIPAddress: FieldIPAddress,
      fieldStationNumber: FieldStationNum,
    };
    window.electron.ipcRenderer.sendMessage('main-quit', data);
  }, [IPAddress, SSHAddress, FieldIPAddress, FieldStationNum]);

  const changeActiveModal = (newModalName: string) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setActiveModal(newModalName);
  };
  useEffect(() => {
    if (window.electron) {
      return window.electron.ipcRenderer.on('renderer-file-control', (data) => {
        const typedData = data as RendererFileControlData;
        if (typedData.type === 'promptSave') {
          const mainFcData: MainFileControlData = {
            type: 'save',
            content: editorContent,
            forceDialog: typedData.forceDialog,
          };
          window.electron.ipcRenderer.sendMessage(
            'main-file-control',
            mainFcData,
          );
        } else if (typedData.type === 'promptLoad') {
          if (editorStatus === 'clean') {
            window.electron.ipcRenderer.sendMessage('main-file-control', {
              type: 'load',
            });
          } else {
            changeActiveModal('DirtyLoadConfirm');
          }
        } else if (typedData.type === 'didSave') {
          setEditorStatus('clean');
        } else if (typedData.type === 'didOpen') {
          setEditorStatus('clean');
          setEditorContent(typedData.content);
        } else if (typedData.type === 'didExternalChange') {
          setEditorStatus('extDirty');
        } else if (typedData.type === 'didChangePath') {
          setEditorPath(typedData.path);
        }
      });
    }
    return () => {};
  }, [editorContent, editorStatus]);

  useEffect(() => {
    if (window.electron) {
      return window.electron.ipcRenderer.on('renderer-quit-request', () => {
        if (activeModal !== 'DirtyQuitConfirm' && editorStatus !== 'clean') {
          changeActiveModal('DirtyQuitConfirm');
        } else {
          closeWindow();
        }
      });
    }
    return () => {};
  }, [activeModal, editorStatus, closeWindow]);

  // Editor ResizeBar handlers:
  const startEditorResize = () => setEditorInitialSize(editorSize);
  const updateEditorResize = (d: number) => {
    if (editorInitialSize === -1) {
      // Drop update, the window was just resized
      return false;
    }
    setEditorSize(
      Math.max(
        Math.min(
          editorInitialSize + d,
          MAX_EDITOR_WIDTH_PERCENT * windowSize[0],
        ),
        MIN_EDITOR_WIDTH_PERCENT * windowSize[0],
      ),
    );
    return true;
  };
  const endEditorResize = () => setEditorInitialSize(-1);

  // Cols ResizeBar handlers:
  const startColsResize = () => setColsInitialSize(colsSize);
  const updateColsResize = (d: number) => {
    if (colsInitialSize === -1) {
      return false;
    }
    setColsSize(
      Math.max(
        Math.min(colsInitialSize + d, MAX_COLS_HEIGHT_PERCENT * windowSize[1]),
        MIN_COLS_HEIGHT_PERCENT * windowSize[1],
      ),
    );
    return true;
  };
  const endColsResize = () => setColsInitialSize(-1);

  const changeEditorContent = (newContent: string) => {
    setEditorContent(newContent);
    if (editorStatus === 'clean') {
      setEditorStatus('dirty');
    }
  };
  const closeModal = () => changeActiveModal('');

  const handleConnectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    if (id === 'IPAddress') {
      setIPAddress(value);
    } else if (id === 'SSHAddress') {
      setSSHAddress(value);
    } else if (id === 'FieldIPAddress') {
      setFieldIPAddress(value);
    } else if (id === 'FieldStationNum') {
      setFieldStationNum(value);
    }
  };

  return (
    <StrictMode>
      <div className="App">
        <Topbar
          onConnectionConfigModalOpen={() =>
            changeActiveModal('ConnectionConfig')
          }
          dawnVersion={dawnVersion}
          runtimeVersion={runtimeVersion}
          robotLatencyMs={robotLatencyMs}
          robotBatteryVoltage={robotBatteryVoltage}
        />
        <div className="App-cols" style={{ height: colsSize }}>
          <Editor
            width={editorSize}
            onChange={changeEditorContent}
            fileStatus={editorStatus}
            filePath={editorPath}
            content={editorContent}
          />
          <ResizeBar
            onStartResize={startEditorResize}
            onUpdateResize={updateEditorResize}
            onEndResize={endEditorResize}
            axis="x"
          />
          <DeviceInfo />
        </div>
        <ResizeBar
          onStartResize={startColsResize}
          onUpdateResize={updateColsResize}
          onEndResize={endColsResize}
          axis="y"
        />
        <AppConsole messages={consoleMsgs} />
        <div className="App-modal-container">
          <ConnectionConfigModal
            isActive={activeModal === 'ConnectionConfig'}
            onClose={closeModal}
            onChange={handleConnectionChange}
            IPAddress={IPAddress}
            SSHAddress={SSHAddress}
            FieldIPAddress={FieldIPAddress}
            FieldStationNum={FieldStationNum}
          />
          <GamepadInfoModal
            isActive={activeModal === 'GamepadInfo'}
            onClose={closeModal}
          />
          <ConfirmModal
            isActive={activeModal === 'DirtyLoadConfirm'}
            onClose={closeModal}
            onConfirm={() => {
              const data: MainFileControlData = { type: 'load' };
              window.electron.ipcRenderer.sendMessage(
                'main-file-control',
                data,
              );
            }}
            queryText="You have unsaved changes. Really load?"
            modalTitle="Confirm load"
          />
          <ConfirmModal
            isActive={activeModal === 'DirtyQuitConfirm'}
            onClose={closeModal}
            onConfirm={closeWindow}
            queryText="You have unsaved changes. Really quit?"
            modalTitle="Confirm quit"
            noAutoClose
          />
        </div>
      </div>
    </StrictMode>
  );
}

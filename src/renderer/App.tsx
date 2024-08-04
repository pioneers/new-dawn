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
  // Whether to warn the user that their changes to the open file will not be uploaded
  const [showDirtyUploadWarning, setShowDirtyUploadWarning] = useState(true);
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
      const listenerDestructors = [
        window.electron.ipcRenderer.on('renderer-init', (data) => {
          setDawnVersion(data.dawnVersion);
          setIPAddress(data.robotIPAddress);
          setSSHAddress(data.robotSSHAddress);
          setFieldIPAddress(data.fieldIPAddress);
          setFieldStationNum(data.fieldStationNumber);
          setShowDirtyUploadWarning(data.showDirtyUploadWarning);
        }),
        window.electron.ipcRenderer.on('renderer-robot-update', (data) => {
          if (data.runtimeVersion !== undefined) {
            setRuntimeVersion(data.runtimeVersion);
          }
          if (data.robotBatteryVoltage !== undefined) {
            setRobotBatteryVoltage(data.robotBatteryVoltage);
          }
          if (data.robotLatencyMs !== undefined) {
            setRobotLatencyMs(data.robotLatencyMs);
          }
        }),
        window.electron.ipcRenderer.on('renderer-post-console', (data) => {
          setConsoleMsgs((old) => [...old, data]);
        }),
      ];
      return () => listenerDestructors.forEach((destructor) => destructor());
    }
    return () => {};
  }, []);

  const closeWindow = useCallback(() => {
    window.electron.ipcRenderer.sendMessage('main-quit', {
      robotIPAddress: IPAddress,
      robotSSHAddress: SSHAddress,
      fieldIPAddress: FieldIPAddress,
      fieldStationNumber: FieldStationNum,
      showDirtyUploadWarning,
    });
  }, [
    IPAddress,
    SSHAddress,
    FieldIPAddress,
    FieldStationNum,
    showDirtyUploadWarning,
  ]);

  const changeActiveModal = (newModalName: string) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setActiveModal(newModalName);
  };
  useEffect(() => {
    if (window.electron) {
      return window.electron.ipcRenderer.on('renderer-file-control', (data) => {
        if (data.type === 'promptSave') {
          window.electron.ipcRenderer.sendMessage('main-file-control', {
            type: 'save',
            content: editorContent,
            forceDialog: data.forceDialog,
          });
        } else if (data.type === 'promptLoad') {
          if (editorStatus === 'clean') {
            window.electron.ipcRenderer.sendMessage('main-file-control', {
              type: 'load',
            });
          } else {
            changeActiveModal('DirtyLoadConfirm');
          }
        } else if (data.type === 'didSave') {
          setEditorStatus('clean');
        } else if (data.type === 'didOpen') {
          if (data.isCleanFile) {
            // Set status to clean if the new editor content came from an opened file
            setEditorStatus('clean');
          } else if (editorStatus === 'clean') {
            // Even if the new editor content was downloaded, don't change the status from extDirty
            // to dirty
            setEditorStatus('dirty');
          }
          setEditorContent(data.content);
        } else if (data.type === 'didExternalChange') {
          setEditorStatus('extDirty');
        } else if (data.type === 'didChangePath') {
          setEditorPath(data.path);
        } else if (data.type === 'promptUpload') {
          if (editorStatus === 'clean') {
            window.electron.ipcRenderer.sendMessage('main-file-control', {
              type: 'upload',
              robotSSHAddress: SSHAddress,
            });
          } else {
            changeActiveModal('DirtyUploadConfirm');
          }
        } else if (data.type === 'promptDownload') {
          if (editorStatus === 'clean') {
            window.electron.ipcRenderer.sendMessage('main-file-control', {
              type: 'download',
              robotSSHAddress: SSHAddress,
            });
          } else {
            changeActiveModal('DirtyDownloadConfirm');
          }
        }
      });
    }
    return () => {};
  }, [editorContent, editorStatus, SSHAddress]);

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
              window.electron.ipcRenderer.sendMessage('main-file-control', {
                type: 'load',
              });
            }}
            modalTitle="Confirm load"
          >
            <p>You have unsaved changes. Really load?</p>
          </ConfirmModal>
          <ConfirmModal
            isActive={activeModal === 'DirtyQuitConfirm'}
            onClose={closeModal}
            onConfirm={closeWindow}
            modalTitle="Confirm quit"
            noAutoClose
          >
            <p>You have unsaved changes. Really quit?</p>
          </ConfirmModal>
          <ConfirmModal
            isActive={activeModal === 'DirtyUploadConfirm'}
            onClose={closeModal}
            onConfirm={() => {
              window.electron.ipcRenderer.sendMessage('main-file-control', {
                type: 'upload',
                robotSSHAddress: SSHAddress,
              });
            }}
            modalTitle="Confirm upload"
          >
            <p>
              Unsaved changes in the editor will not be uploaded. Really upload?
            </p>
            <label htmlFor="show-dirty-upload-warning">
              <input
                type="checkbox"
                name="show-dirty-upload-warning"
                onChange={(e) => setShowDirtyUploadWarning(!e.target.checked)}
              />
              Don&apos;t show this warning again
            </label>
          </ConfirmModal>
          <ConfirmModal
            isActive={activeModal === 'DirtyDownloadConfirm'}
            onClose={closeModal}
            onConfirm={() => {
              window.electron.ipcRenderer.sendMessage('main-file-control', {
                type: 'download',
                robotSSHAddress: SSHAddress,
              });
            }}
            modalTitle="Confirm download"
          >
            <p>
              You have unsaved changes. Really replace editor contents with
              downloaded code?
            </p>
          </ConfirmModal>
        </div>
      </div>
    </StrictMode>
  );
}

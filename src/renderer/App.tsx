/* eslint no-bitwise: 'off' */
import {
  StrictMode,
  useState,
  useCallback,
  useReducer,
  useEffect,
  useLayoutEffect,
} from 'react';
import Topbar from './Topbar';
import Editor, { EditorContentStatus, KeyboardControlsStatus } from './Editor';
import DeviceInfo from './DeviceInfo';
import AppConsole from './AppConsole';
import type AppConsoleMessage from '../common/AppConsoleMessage'; // No crypto package on the renderer
import type DeviceInfoState from '../common/DeviceInfoState';
import ConfirmModal from './modals/ConfirmModal';
import ConnectionConfigModal, {
  ConnectionConfigChangeEvent,
} from './modals/ConnectionConfigModal';
import HelpModal from './modals/HelpModal';
import GamepadInfoModal from './modals/GamepadInfoModal';
import ResizeBar from './ResizeBar';
import {
  Mode as RobotRunMode,
  Source as RobotInputSource,
  Input as RobotInput,
} from '../../protos-main/protos';
import robotKeyNumberMap from './robotKeyNumberMap';
import './App.css';

const INITIAL_EDITOR_WIDTH_PERCENT = 0.7;
const INITIAL_CONSOLE_HEIGHT_PERCENT = 0.3;
const MAX_EDITOR_WIDTH_PERCENT = 0.9;
const MAX_CONSOLE_HEIGHT_PERCENT = 0.6;
const MIN_EDITOR_WIDTH_PERCENT = 0.6;
const MIN_CONSOLE_HEIGHT_PERCENT = 0.3;
const GAMEPAD_UPDATE_PERIOD_MS = 50;

/**
 * Top-level component that communicates with main process and contains most renderer state.
 */
export default function App() {
  // Current width of editor in pixels
  const [editorSize, setEditorSize] = useState(-1);
  // Width of editor before ongoing resize in pixels, -1 if no resize
  const [editorInitialSize, setEditorInitialSize] = useState(-1);
  // Current height of console in pixels
  const [consoleSize, setConsoleSize] = useState(-1);
  // Height of console before ongoing resize in pixels, -1 if no resize
  const [consoleInitialSize, setConsoleInitSize] = useState(-1);
  // Name of active modal, empty if no modal is active
  const [activeModal, setActiveModal] = useState('');
  // Dawn version string, received from main process
  const [dawnVersion, setDawnVersion] = useState('');
  // Robot battery voltage, -1 if disconnected from robot
  const [robotBatteryVoltage, setRobotBatteryVoltage] = useState(-1);
  // Robot latency, -1 if disconnected from robot
  const [robotLatencyMs, setRobotLatencyMs] = useState(-1);
  // Text content of editor
  const [editorContent, setEditorContent] = useState('');
  // Clean/dirty/extDirty status of edited file
  const [editorStatus, setEditorStatus] = useState(
    'clean' as EditorContentStatus,
  );
  // Whether to warn the user that their changes to the open file will not be uploaded
  const [showDirtyUploadWarning, setShowDirtyUploadWarning] = useState(true);
  // Path to file in editor, empty if no save path
  const [editorPath, setEditorPath] = useState('');
  // AppConsoleMessages displayed in AppConsole
  const [consoleMsgs, setConsoleMsgs] = useState([] as AppConsoleMessage[]);
  // Whether the AppConsole is open
  const [consoleIsOpen, setConsoleIsOpen] = useState(true);
  // Whether a new message has been added to the AppConsole since it has been closed (if it is
  // closed)
  const [consoleIsAlerted, setConsoleIsAlerted] = useState(false);
  // Whether keyboard controls are enabled.
  const [keyboardControlsEnabled, setKeyboardControlsEnabled] = useState(
    'on' as KeyboardControlsStatus,
  );
  // Whether the robot is running student code
  const [robotRunning, setRobotRunning] = useState(false);
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
      setConsoleSize((old) => {
        if (consoleSize === -1) {
          return INITIAL_CONSOLE_HEIGHT_PERCENT * newSize[1];
        }
        return (old * newSize[1]) / oldSize[1];
      });
      // Cancel any current resize
      setEditorInitialSize(-1);
      setConsoleInitSize(-1);
      return newSize;
    },
    [-1, -1],
  );
  // Connection configuration
  const [IPAddress, setIPAddress] = useState('192.168.0.100');
  const [SSHAddress, setSSHAddress] = useState('192.168.0.100');
  const [FieldIPAddress, setFieldIPAddress] = useState('localhost');
  const [FieldStationNum, setFieldStationNum] = useState('4');
  // Information about periperhals connected to the robot
  const [deviceInfoState, setDeviceInfoState] = useState(
    [] as DeviceInfoState[],
  );

  const changeActiveModal = (newModalName: string) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setActiveModal(newModalName);
  };
  const changeEditorContent = (newContent: string) => {
    setEditorContent(newContent);
    if (editorStatus === 'clean') {
      setEditorStatus('dirty');
    }
  };
  const closeModal = () => changeActiveModal('');
  const handleConnectionChange = (event: ConnectionConfigChangeEvent) => {
    if (event.name === 'IPAddress') {
      setIPAddress(event.value);
    } else if (event.name === 'SSHAddress') {
      setSSHAddress(event.value);
    } else if (event.name === 'FieldIPAddress') {
      setFieldIPAddress(event.value);
    } else if (event.name === 'FieldStationNum') {
      setFieldStationNum(event.value);
    }
  };
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
  const startColsResize = () => setConsoleInitSize(consoleSize);
  const updateColsResize = (d: number) => {
    if (consoleInitialSize === -1) {
      return false;
    }
    // Subtract d because this ResizeBar controls the console's upper edge
    setConsoleSize(
      Math.max(
        Math.min(
          consoleInitialSize - d,
          MAX_CONSOLE_HEIGHT_PERCENT * windowSize[1],
        ),
        MIN_CONSOLE_HEIGHT_PERCENT * windowSize[1],
      ),
    );
    return true;
  };
  const endColsResize = () => setConsoleInitSize(-1);
  const changeRunMode = (mode: RobotRunMode) => {
    window.electron.ipcRenderer.sendMessage('main-update-robot-mode', mode);
    setRobotRunning(mode !== RobotRunMode.IDLE);
  };

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
  const saveFile = useCallback(
    (forceDialog: boolean) => {
      window.electron.ipcRenderer.sendMessage('main-file-control', {
        type: 'save',
        content: editorContent,
        forceDialog,
      });
    },
    [editorContent],
  );
  const loadFile = useCallback(() => {
    if (editorStatus === 'clean') {
      window.electron.ipcRenderer.sendMessage('main-file-control', {
        type: 'load',
      });
    } else {
      changeActiveModal('DirtyLoadConfirm');
    }
  }, [editorStatus]);
  const uploadDownloadFile = useCallback(
    (isUpload: boolean) => {
      const modalName = isUpload
        ? 'DirtyUploadConfirm'
        : 'DirtyDownloadConfirm';
      if (editorStatus === 'clean' || activeModal === modalName) {
        window.electron.ipcRenderer.sendMessage('main-file-control', {
          type: isUpload ? 'upload' : 'download',
          robotSSHAddress: SSHAddress,
        });
      } else {
        changeActiveModal(modalName);
      }
    },
    [editorStatus, SSHAddress, activeModal],
  );
  const createNewFile = useCallback(() => {
    if (editorStatus === 'clean' || activeModal === 'DirtyNewFileConfirm') {
      setEditorPath('');
      setEditorContent('');
      setEditorStatus('clean');
      window.electron.ipcRenderer.sendMessage('main-file-control', {
        type: 'clearSavePath',
      });
    } else {
      changeActiveModal('DirtyNewFileConfirm');
    }
  }, [activeModal, editorStatus]);

  // Update windowSize:
  useLayoutEffect(() => {
    const onResize = () =>
      setWindowSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    // Storing bitmap as closure useful side effect of resetting bitmap to 0 when kb ctrl toggled
    // Also using bigint so bitwise operators don't wrap to 32 bits
    let keyboardBitmap = 0n;
    const onKeyChange = (key: string, down: boolean) => {
      if (key in robotKeyNumberMap) {
        const bit = 1n << BigInt(robotKeyNumberMap[key]);
        if (down) {
          keyboardBitmap |= bit;
        } else {
          keyboardBitmap &= ~bit;
        }
      }
    };
    const onKeyDown = ({ key }: { key: string }) => onKeyChange(key, true);
    window.addEventListener('keydown', onKeyDown);
    const onKeyUp = ({ key }: { key: string }) => onKeyChange(key, false);
    window.addEventListener('keyup', onKeyUp);
    const gamepadUpdateInterval = setInterval(() => {
      // Possible bug requires testing: gamepad indices are not preserved after filtering
      // Filter removes disconnected and 'ghost'/duplicate gamepads (can be distinguished by
      // different mapping)
      const inputs = navigator
        .getGamepads()
        .filter((gp): gp is Gamepad => gp !== null && gp.mapping === 'standard')
        .map((gp) => {
          let buttonBitmap: number = 0;
          gp.buttons.forEach((button, buttonIdx) => {
            if (button.pressed) {
              buttonBitmap |= 1 << buttonIdx;
            }
          });
          return new RobotInput({
            connected: gp.connected,
            axes: gp.axes.slice(),
            buttons: buttonBitmap,
            source: RobotInputSource.GAMEPAD,
          });
        });
      if (keyboardControlsEnabled !== 'off') {
        // Possible bug requires testing: is Runtime ok with mixed input sources in same packet?
        inputs.push(
          new RobotInput({
            connected: keyboardControlsEnabled === 'on',
            axes: [],
            buttons: keyboardControlsEnabled ? Number(keyboardBitmap) : 0,
            source: RobotInputSource.KEYBOARD,
          }),
        );
        if (keyboardControlsEnabled === 'offEdge') {
          setKeyboardControlsEnabled('off');
        }
      }
      window.electron.ipcRenderer.sendMessage('main-robot-input', inputs);
    }, GAMEPAD_UPDATE_PERIOD_MS);
    return () => {
      clearInterval(gamepadUpdateInterval);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [keyboardControlsEnabled]);
  useEffect(() => {
    // Tests won't run main/preload.ts
    if (window.electron) {
      const listenerDestructors = [
        window.electron.ipcRenderer.on('renderer-init', (data) => {
          setDawnVersion(data.dawnVersion);
          setIPAddress(data.robotIPAddress);
          setSSHAddress(data.robotSSHAddress);
          setFieldIPAddress(data.fieldIPAddress);
          setFieldStationNum(data.fieldStationNumber);
          setShowDirtyUploadWarning(data.showDirtyUploadWarning);
          document.getElementsByTagName(
            'title',
          )[0].innerText = `Dawn ${data.dawnVersion}`;
        }),
        window.electron.ipcRenderer.on(
          'renderer-battery-update',
          setRobotBatteryVoltage,
        ),
        window.electron.ipcRenderer.on('renderer-latency-update', (latency) => {
          setRobotLatencyMs(latency);
          if (latency === -1) {
            setDeviceInfoState([]); // Disconnect everything
            setRobotRunning(false);
          }
        }),
        window.electron.ipcRenderer.on(
          'renderer-devices-update',
          setDeviceInfoState,
        ),
      ];
      return () => listenerDestructors.forEach((destructor) => destructor());
    }
    return () => {};
  }, []);
  useEffect(() => {
    if (window.electron) {
      return window.electron.ipcRenderer.on('renderer-post-console', (data) => {
        setConsoleMsgs((old) => [...old, data]);
        if (!consoleIsOpen) {
          setConsoleIsAlerted(true);
        }
      });
    }
    return () => {};
  }, [consoleIsOpen]);
  useEffect(() => {
    if (window.electron) {
      return window.electron.ipcRenderer.on('renderer-file-control', (data) => {
        if (data.type === 'promptSave') {
          saveFile(data.forceDialog);
        } else if (data.type === 'promptLoad') {
          loadFile();
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
          uploadDownloadFile(true);
        } else if (data.type === 'promptDownload') {
          uploadDownloadFile(false);
        } else if (data.type === 'promptCreateNewFile') {
          createNewFile();
        }
      });
    }
    return () => {};
  }, [editorStatus, saveFile, loadFile, uploadDownloadFile, createNewFile]);

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

  return (
    <StrictMode>
      <div className="App">
        <Topbar
          onConnectionConfigModalOpen={() =>
            changeActiveModal('ConnectionConfig')
          }
          onHelpModalOpen={() => changeActiveModal('Help')}
          dawnVersion={dawnVersion}
          robotLatencyMs={robotLatencyMs}
          robotBatteryVoltage={robotBatteryVoltage}
        />
        <div className="App-cols">
          <Editor
            width={editorSize}
            onChange={changeEditorContent}
            fileStatus={editorStatus}
            filePath={editorPath}
            content={editorContent}
            consoleAlert={consoleIsAlerted}
            consoleIsOpen={consoleIsOpen}
            keyboardControlsEnabled={keyboardControlsEnabled}
            robotConnected={robotLatencyMs !== -1}
            robotRunning={robotRunning}
            onOpen={loadFile}
            onSave={saveFile}
            onNewFile={createNewFile}
            onRobotUpload={() => uploadDownloadFile(true)}
            onRobotDownload={() => uploadDownloadFile(false)}
            onStartRobot={(opmode: 'auto' | 'teleop') => {
              changeRunMode(
                opmode === 'auto' ? RobotRunMode.AUTO : RobotRunMode.TELEOP,
              );
            }}
            onStopRobot={() => changeRunMode(RobotRunMode.IDLE)}
            onToggleConsole={() => {
              setConsoleIsOpen((v) => !v);
              setConsoleIsAlerted(false);
            }}
            onClearConsole={() => {
              setConsoleMsgs([]);
              setConsoleIsAlerted(false);
            }}
            onToggleKeyboardControls={() => {
              setKeyboardControlsEnabled((v) =>
                v === 'on' ? 'offEdge' : 'on',
              );
            }}
          />
          <ResizeBar
            onStartResize={startEditorResize}
            onUpdateResize={updateEditorResize}
            onEndResize={endEditorResize}
            axis="x"
          />
          <DeviceInfo deviceStates={deviceInfoState} />
        </div>
        {consoleIsOpen && (
          <>
            <ResizeBar
              onStartResize={startColsResize}
              onUpdateResize={updateColsResize}
              onEndResize={endColsResize}
              axis="y"
            />
            <AppConsole height={consoleSize} messages={consoleMsgs} />
          </>
        )}
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
          <HelpModal isActive={activeModal === 'Help'} onClose={closeModal} />
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
            <p className="App-confirm-dialog-text">
              You have unsaved changes. Really load?
            </p>
          </ConfirmModal>
          <ConfirmModal
            isActive={activeModal === 'DirtyQuitConfirm'}
            onClose={closeModal}
            onConfirm={closeWindow}
            modalTitle="Confirm quit"
            noAutoClose
          >
            <p className="App-confirm-dialog-text">
              You have unsaved changes. Really quit?
            </p>
          </ConfirmModal>
          <ConfirmModal
            isActive={activeModal === 'DirtyUploadConfirm'}
            onClose={closeModal}
            onConfirm={() => uploadDownloadFile(true)}
            modalTitle="Confirm upload"
          >
            <p className="App-confirm-dialog-text">
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
            onConfirm={() => uploadDownloadFile(false)}
            modalTitle="Confirm download"
          >
            <p className="App-confirm-dialog-text">
              You have unsaved changes. Really replace editor contents with
              downloaded code?
            </p>
          </ConfirmModal>
          <ConfirmModal
            isActive={activeModal === 'DirtyNewFileConfirm'}
            onClose={closeModal}
            onConfirm={createNewFile}
            modalTitle="Confirm create new file"
          >
            <p className="App-confirm-dialog-text">
              You have unsaved changes. Really close file?
            </p>
          </ConfirmModal>
        </div>
      </div>
    </StrictMode>
  );
}

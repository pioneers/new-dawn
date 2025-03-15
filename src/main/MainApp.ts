import { dialog, ipcMain } from 'electron';
import type { BrowserWindow, FileFilter } from 'electron';
import fs from 'fs';
import { version as dawnVersion } from '../../package.json';
import AppConsoleMessage from '../common/AppConsoleMessage';
import DeviceInfoState, { DeviceType } from '../common/DeviceInfoState';
import type {
  RendererChannels,
  RendererInitData,
  RendererFileControlData,
  RendererPostConsoleData,
  RendererBatteryUpdateData,
  RendererLatencyUpdateData,
  RendererDevicesUpdateData,
  MainChannels,
  MainConnectionConfigData,
  MainFileControlData,
  MainQuitData,
  MainUpdateRobotModeData,
  MainRobotInputData,
} from '../common/IpcEventTypes';
import Config, { coerceToConfig } from './Config';
import CodeTransfer from './network/CodeTransfer';
import RuntimeComms, { RuntimeCommsListener } from './network/RuntimeComms';
import type { MenuHandler } from './menu';

/**
 * Cooldown time in milliseconds to wait between sending didExternalChange messages to the renderer
 * process.
 */
const WATCH_DEBOUNCE_MS = 3000;
/**
 * Electron file filters for the save and open dialogs.
 */
const CODE_FILE_FILTERS: FileFilter[] = [
  { name: 'Python Files', extensions: ['py'] },
  { name: 'All Files', extensions: ['*'] },
];
/**
 * Relative path to persistent configuration file.
 */
const CONFIG_RELPATH = 'dawn-config.json';
/**
 * Port to use when connecting to robot with SSH.
 */
const ROBOT_SSH_PORT = 22;
/**
 * Username to log in as when connecting to robot with SSH.
 */
const ROBOT_SSH_USER = 'ubuntu';
/**
 * Password to log in with when connecting to robot with SSH.
 */
const ROBOT_SSH_PASS = 'potato';
/**
 * Path on robot to upload student code to.
 */
const REMOTE_CODE_PATH = `/home/${ROBOT_SSH_USER}/runtime/executor/studentcode.py`;

/**
 * Adds a listener for the main-quit IPC event fired by the renderer.
 * @param channel - the event channel to listen to
 * @param func - the listener to attach
 */
function addRendererListener(
  channel: 'main-quit',
  func: (data: MainQuitData) => void,
): void;

/**
 * Adds a listener for the main-file-control IPC event fired by the renderer.
 * @param channel - the event channel to listen to
 * @param func - the listener to attach
 */
function addRendererListener(
  channel: 'main-file-control',
  func: (data: MainFileControlData) => void,
): void;

/**
 * Adds a listener for the main-update-robot-mode IPC event fired by the renderer.
 * @param channel - the event channel to listen to
 * @param func - the listener to attach
 */
function addRendererListener(
  channel: 'main-update-robot-mode',
  func: (data: MainUpdateRobotModeData) => void,
): void;

/**
 * Adds a listener for the main-connection-config IPC event fired by the renderer.
 * @param channel - the event channel to listen to
 * @param func - the listener to attach
 */
function addRendererListener(
  channel: 'main-connection-config',
  func: (data: MainConnectionConfigData) => void,
): void;

/**
 * Adds a listener for the main-robot-input IPC event fired by the renderer.
 * @param channel - the event channel to listen to
 * @param func - the listener to attach
 */
function addRendererListener(
  channel: 'main-robot-input',
  func: (data: MainRobotInputData) => void,
): void;

/**
 * Typed wrapper function to listen to IPC events from the renderer.
 * @param channel - the event channel to listen to
 * @param func - the listener to attach
 */
function addRendererListener(
  channel: MainChannels,
  func: (data: any) => void,
): void {
  ipcMain.on(channel, (_event, data: any) => func(data));
}

/**
 * Manages state owned by the main electron process.
 */
export default class MainApp implements MenuHandler, RuntimeCommsListener {
  /**
   * The BrowserWindow.
   */
  readonly #mainWindow: BrowserWindow;

  /**
   * The last saved to or opened path of the student code file.
   */
  #savePath: string | null;

  /**
   * A file watcher that watches the last saved path to detect external changes to the currently
   * open file.
   */
  #watcher: fs.FSWatcher | null;

  /**
   * Whether the file watcher is currently sensitive to watch events. Watch events trigger a
   * cooldown so spurious didExternalChange messages aren't sent to the renderer process.
   */
  #watchDebounce: boolean;

  /**
   * Whether the next attempt to close the main window should instead notify the renderer and expect
   * a return event if this is ok.
   */
  #preventQuit: boolean;

  /**
   * Whether the message informing the user the robot has discnonected will be
   * suppressed. Used so disconnects only generate one log message.
   */
  #suppressDisconnectMsg: boolean;

  /**
   * Whether error messages relating to connectivity will be suppressed. Used so disconnects only
   * generate one log message and possibly (hopefully?) the causing error.
   */
  #suppressNetworkErrors: boolean;

  /**
   * Whether error messages relating to the PDB will be suppressed. Used so faulty PDBs do not flood
   * the console.
   */
  #suppressPdbErrors: boolean;

  /**
   * Whether verbose debugging logs should be written to the AppConsole. Also changes the behavior
   * of some error reporting code.
   */
  #runtimeTraceMode: boolean;

  /**
   * Persistent configuration loaded when MainApp is constructed and saved when the main window is
   * closed.
   */
  readonly #config: Config;

  /**
   * CodeTransfer used to upload/download code to/from the robot.
   */
  readonly #codeTransfer: CodeTransfer;

  /**
   * Object used to communicate with Runtime.
   */
  readonly #runtimeComms: RuntimeComms;

  /**
   * @param mainWindow - the BrowserWindow.
   */
  constructor(mainWindow: BrowserWindow) {
    this.#mainWindow = mainWindow;
    this.#savePath = null;
    this.#watcher = null;
    this.#watchDebounce = true;
    this.#preventQuit = true;
    this.#suppressDisconnectMsg = false;
    this.#suppressNetworkErrors = false;
    this.#suppressPdbErrors = false;
    this.#runtimeTraceMode = false;
    this.#codeTransfer = new CodeTransfer(
      REMOTE_CODE_PATH,
      ROBOT_SSH_PORT,
      ROBOT_SSH_USER,
      ROBOT_SSH_PASS,
    );
    this.#runtimeComms = new RuntimeComms(this);

    mainWindow.on('close', (e) => {
      if (this.#preventQuit) {
        e.preventDefault();
        this.#sendToRenderer('renderer-quit-request');
      }
    });
    addRendererListener('main-file-control', (data) => {
      if (data.type === 'save') {
        this.#saveCodeFile(data.content, data.forceDialog);
      } else if (data.type === 'load') {
        this.#openCodeFile();
      } else if (data.type === 'upload') {
        this.#uploadCodeFile(data.robotSSHAddress);
      } else if (data.type === 'download') {
        this.#downloadCodeFile(data.robotSSHAddress);
      } else if (data.type === 'clearSavePath') {
        this.#savePath = null;
        this.#watcher?.close();
      }
    });
    addRendererListener('main-quit', (data) => {
      this.#config.showDirtyUploadWarning = data.showDirtyUploadWarning;
      this.#config.darkmode = data.darkmode;
      try {
        fs.writeFileSync(CONFIG_RELPATH, JSON.stringify(this.#config));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Failed to write config on quit. ${String(e)}`);
      }
      this.#preventQuit = false;
      this.#mainWindow.close();
    });
    addRendererListener(
      'main-update-robot-mode',
      this.#runtimeComms.sendRunMode.bind(this.#runtimeComms),
    );
    addRendererListener('main-connection-config', (data) => {
      this.onTrace(`Robot ip changed to ${data.robotIPAddress}`);
      this.#runtimeComms.setRobotIp(data.robotIPAddress);
      Object.assign(this.#config, data);
    });
    addRendererListener(
      'main-robot-input',
      this.#runtimeComms.sendInputs.bind(this.#runtimeComms),
    );

    try {
      this.#config = coerceToConfig(
        JSON.parse(
          fs.readFileSync(CONFIG_RELPATH, {
            encoding: 'utf8',
            flag: 'r',
          }),
        ),
      );
    } catch {
      // Use all defaults if bad JSON or no config file
      this.#config = coerceToConfig({});
    }

    this.#runtimeComms.setRobotIp(this.#config.robotIPAddress);
  }

  /**
   * Lifecycle method to be called when the renderer process has finished initializing. This may
   * happen more than once in the program's lifetime (e.g. if the BrowserWindow is somehow
   * reloaded).
   */
  onPresent() {
    this.#watcher?.close();
    this.#savePath = null;
    this.#sendToRenderer('renderer-init', {
      dawnVersion,
      robotIPAddress: this.#config.robotIPAddress,
      fieldIPAddress: this.#config.fieldIPAddress,
      fieldStationNumber: this.#config.fieldStationNumber,
      showDirtyUploadWarning: this.#config.showDirtyUploadWarning,
      darkmode: this.#config.darkmode,
    });
  }

  onReceiveRobotLogs(msgs: string[]) {
    msgs.forEach((msg) => {
      this.#sendToRenderer(
        'renderer-post-console',
        new AppConsoleMessage('robot-info', msg),
      );
    });
  }

  onReceiveLatency(latency: number) {
    this.#sendToRenderer('renderer-latency-update', latency);
  }

  onReceiveDevices(deviceInfoState: DeviceInfoState[]) {
    this.#sendToRenderer('renderer-devices-update', deviceInfoState);
    const pdbs = deviceInfoState.filter(
      (state) => state.id.split('_')[0] === DeviceType.PDB.toString(),
    );
    if (pdbs.length !== 1) {
      if (!this.#suppressPdbErrors) {
        this.#sendToRenderer(
          'renderer-post-console',
          new AppConsoleMessage(
            'dawn-err',
            'Cannot read battery voltage. Not exactly one PDB is connected to the robot.',
          ),
        );
        this.#suppressPdbErrors = true;
      }
    } else if (!('v_batt' in pdbs[0]) || Number.isNaN(Number(pdbs[0].v_batt))) {
      if (!this.#suppressPdbErrors) {
        this.#sendToRenderer(
          'renderer-post-console',
          new AppConsoleMessage(
            'dawn-err',
            'PDB does not have v_batt property or it is not a number.',
          ),
        );
        this.#suppressPdbErrors = true;
      }
    } else {
      this.#sendToRenderer('renderer-battery-update', Number(pdbs[0].v_batt));
      this.#suppressPdbErrors = false;
    }
  }

  onRuntimeTcpError(err: Error) {
    if (!this.#suppressNetworkErrors || this.#runtimeTraceMode) {
      const rawMsg = err.toString();
      let msg;
      if (
        rawMsg.includes('ETIMEDOUT') ||
        rawMsg.includes('ENETUNREACH') ||
        rawMsg.includes('ECONNREFUSED') ||
        rawMsg.includes('EHOSTUNREACH')
      ) {
        msg =
          "Can't find the robot! Please make sure you are connected to the robot's router," +
          ' the IP is set correctly, and the robot is turned on.';
      } else if (rawMsg.includes('ENOTFOUND')) {
        msg = 'The robot ip is invalid. Please specify a valid ip.';
      } else if (
        rawMsg.includes('ECONNABORTED') ||
        rawMsg.includes('ECONNRESET')
      ) {
        msg =
          'Temporary robot communication error! Dawn will attempt to reconnect.';
      } else if (rawMsg.includes('Timeout!')) {
        msg = 'The robot is not responding. Dawn will attempt to reconnect.';
      } else {
        msg = `Encountered TCP error when communicating with Runtime. ${rawMsg}`;
      }
      this.#sendToRenderer(
        'renderer-post-console',
        new AppConsoleMessage(
          'dawn-err',
          `${
            this.#runtimeTraceMode ? '(Showing suppressed message.) ' : ''
          }${msg}${
            this.#runtimeTraceMode ? ` (Original message: ${rawMsg})` : ''
          }`,
        ),
      );
    }
  }

  onRuntimeError(err: Error) {
    if (!this.#suppressNetworkErrors || this.#runtimeTraceMode) {
      this.#sendToRenderer(
        'renderer-post-console',
        new AppConsoleMessage(
          'dawn-err',
          `{this.#runtimeTraceMode ? '(Showing suppressed message.) ' : ''}` +
            `Encountered error when communicating with Runtime. ${err.toString()}`,
        ),
      );
    }
  }

  onTrace(msg: string) {
    if (this.#runtimeTraceMode) {
      this.#sendToRenderer(
        'renderer-post-console',
        new AppConsoleMessage('dawn-info', msg),
      );
    }
  }

  onRuntimeDisconnect() {
    this.#sendToRenderer('renderer-latency-update', -1);
    if (!this.#suppressDisconnectMsg || this.#runtimeTraceMode) {
      this.#sendToRenderer(
        'renderer-post-console',
        new AppConsoleMessage(
          'dawn-info',
          `${
            this.#runtimeTraceMode ? '(Showing suppressed message.) ' : ''
          }Disconnected from robot.`,
        ),
      );
      this.#suppressDisconnectMsg = true;
    }
  }

  onRuntimeConnect() {
    this.#suppressNetworkErrors = false;
    this.#suppressDisconnectMsg = false;
  }

  /**
   * Requests that the renderer process start to save the code in the editor.
   * @param forceDialog - whether the save path selection dialog should be shown even if there is
   * a currently opened file that may be saved to.
   */
  promptSaveCodeFile(forceDialog: boolean) {
    // We need a round trip to the renderer because that's where the code in the editor actually
    // lives
    this.#sendToRenderer('renderer-file-control', {
      type: 'promptSave',
      forceDialog,
    });
  }

  /**
   * Requests that the renderer process start to load code from a file into the editor. The renderer
   * may delay or ignore this request (e.g. if the editor has unsaved changes).
   */
  promptLoadCodeFile() {
    this.#sendToRenderer('renderer-file-control', { type: 'promptLoad' });
  }

  /**
   * Requests that the renderer process start to upload the last loaded file to the robot. The round
   * trip is needed to notify the user that unsaved changes in the editor will not be uploaded.
   */
  promptUploadCodeFile() {
    this.#sendToRenderer('renderer-file-control', { type: 'promptUpload' });
  }

  /**
   * Requests that the renderer process start to download code from the robot into the editor. The
   * renderer may delay or ignore this request (e.g. if the editor has unsaved changes).
   */
  promptDownloadCodeFile() {
    this.#sendToRenderer('renderer-file-control', { type: 'promptDownload' });
  }

  /**
   * Requests that the renderer process close the open file in the editor. The renderer may delay or
   * ignore this request (e.g. if there are unsaved changes).
   */
  promptCreateNewCodeFile() {
    this.#sendToRenderer('renderer-file-control', {
      type: 'promptCreateNewFile',
    });
  }

  getRuntimeTraceMode() {
    return this.#runtimeTraceMode;
  }

  setRuntimeTraceMode(mode: boolean) {
    this.#runtimeTraceMode = mode;
  }

  /**
   * Tries to save code to a file. Fails if the user is prompted for a path but does not enter one.
   * @param code - the code to save
   * @param forceDialog - whether the user should be prompted for a save path even if there is a
   * currently open file.
   */
  #saveCodeFile(code: string, forceDialog: boolean) {
    let success = true;
    if (this.#savePath === null || forceDialog) {
      success = this.#showCodePathDialog('save');
    }
    if (success) {
      // Temporarily disable watcher
      this.#watcher?.close();
      this.#watcher = null;
      fs.writeFile(
        this.#savePath as string,
        code,
        { encoding: 'utf8', flag: 'w' },
        (err) => {
          if (err) {
            this.#sendToRenderer(
              'renderer-post-console',
              new AppConsoleMessage(
                'dawn-err',
                `Failed to save code to ${this.#savePath}. ${err}`,
              ),
            );
          } else {
            this.#sendToRenderer('renderer-file-control', { type: 'didSave' });
          }
          this.#watchCodeFile();
        },
      );
    }
  }

  /**
   * Tries to load code from a file into the editor. Fails if the user does not choose a path.
   */
  #openCodeFile() {
    const success = this.#showCodePathDialog('load');
    if (success) {
      try {
        const content = fs.readFileSync(this.#savePath as string, {
          encoding: 'utf8',
          flag: 'r',
        });
        this.#sendToRenderer('renderer-file-control', {
          type: 'didOpen',
          content,
          isCleanFile: true,
        });
      } catch {
        // Don't care
      }
    }
  }

  /**
   * Uploads the last saved or opened file (which doesn't necessarily match the current editor
   * contents) to the robot at the given IP. Does nothing if no file has been opened yet.
   * @param ip - the IP address to connect to via SSH
   */
  #uploadCodeFile(ip: string) {
    if (this.#savePath) {
      if (
        fs
          .readFileSync(this.#savePath, { encoding: 'utf8', flag: 'r' })
          .split('')
          .some((c) => c.charCodeAt(0) > 127)
      ) {
        this.#sendToRenderer(
          'renderer-post-console',
          new AppConsoleMessage(
            'dawn-err',
            'Robot code may not contain non-ASCII characters.',
          ),
        );
      } else {
        this.#codeTransfer
          .upload(this.#savePath, ip)
          .then(() => {
            this.#sendToRenderer(
              'renderer-post-console',
              new AppConsoleMessage('dawn-info', 'Code uploaded successfully.'),
            );
            return null;
          })
          .catch((e) => {
            this.#sendToRenderer(
              'renderer-post-console',
              new AppConsoleMessage(
                'dawn-err',
                `Failed to upload code. ${this.#getErrorDetails(e)}`,
              ),
            );
          });
      }
    } else {
      this.#sendToRenderer(
        'renderer-post-console',
        new AppConsoleMessage(
          'dawn-err',
          'Code must be saved to a file before it can be uploaded to the robot.',
        ),
      );
    }
  }

  /**
   * Downloads code from the robot at the given IP into the editor.
   * @param ip - the IP address to connect to via SSH
   */
  #downloadCodeFile(ip: string) {
    this.#codeTransfer
      .download(ip)
      .then((content: string) => {
        this.#sendToRenderer(
          'renderer-post-console',
          new AppConsoleMessage('dawn-info', 'Code downloaded successfully.'),
        );
        this.#sendToRenderer('renderer-file-control', {
          type: 'didOpen',
          content,
          isCleanFile: false,
        });
        return null;
      })
      .catch((e) => {
        this.#sendToRenderer(
          'renderer-post-console',
          new AppConsoleMessage(
            'dawn-err',
            `Failed to download code. ${this.#getErrorDetails(e)}`,
          ),
        );
      });
  }

  /**
   * Utility method that converts a value to a string. If given an Error, prints its stack and
   * recurses into its cause. Exclusively used so the nested errors thrown by CodeTransfer can be
   * shown in the AppConsole.
   * @param e - the value
   * @returns A string representation of the value.
   */
  #getErrorDetails(e: any) {
    let msg = e instanceof Error ? e.stack : String(e);
    if (e.cause) {
      msg += `\nCaused by: ${this.#getErrorDetails(e.cause)}`;
    }
    return msg;
  }

  /**
   * Shows an open or save dialog to the user to select a new save path. On success, this.#savePath
   * is known to be non-null and non-empty.
   * @param mode - the type of dialog that should be shown
   * @returns Whether a new path was chosen successfully.
   */
  #showCodePathDialog(mode: 'save' | 'load') {
    let result: string | string[] | undefined;
    if (mode === 'save') {
      result = dialog.showSaveDialogSync(this.#mainWindow, {
        filters: CODE_FILE_FILTERS,
        ...(this.#savePath === null ? {} : { defaultPath: this.#savePath }),
      });
    } else {
      result = dialog.showOpenDialogSync(this.#mainWindow, {
        filters: CODE_FILE_FILTERS,
        properties: ['openFile'],
      });
    }
    if (result && result.length) {
      this.#savePath = typeof result === 'string' ? result : result[0];
      const data: RendererFileControlData = {
        type: 'didChangePath',
        path: this.#savePath,
      };
      this.#sendToRenderer('renderer-file-control', data);
      if (mode === 'load') {
        this.#watchCodeFile();
      }
      return true;
    }
    return false;
  }

  /**
   * Attaches a file watcher to listen for external changes to the last saved or loaded code path,
   * destroying the previous one if it exists.
   */
  #watchCodeFile() {
    this.#watcher?.close();
    this.#watchDebounce = true;
    this.#watcher = fs.watch(
      this.#savePath as string,
      { persistent: false, encoding: 'utf8' },
      () => {
        // Don't care what the event type is
        if (this.#watchDebounce) {
          this.#watchDebounce = false;
          setTimeout(() => {
            this.#watchDebounce = true;
          }, WATCH_DEBOUNCE_MS);
          const data: RendererFileControlData = {
            type: 'didExternalChange',
          };
          this.#sendToRenderer('renderer-file-control', data);
        }
      },
    );
  }

  /**
   * Sends a renderer-quit-request IPC event to the renderer.
   * @param channel - the channel to send the event on
   */
  #sendToRenderer(channel: 'renderer-quit-request'): void;

  /**
   * Sends a renderer-init IPC event to the renderer.
   * @param channel - the channel to send the event on
   * @param data - a payload for the renderer-init event
   */
  #sendToRenderer(channel: 'renderer-init', data: RendererInitData): void;

  /**
   * Sends a renderer-file-control IPC event to the renderer.
   * @param channel - the channel to send the event on
   * @param data - a payload for the renderer-file-control event
   */
  #sendToRenderer(
    channel: 'renderer-file-control',
    data: RendererFileControlData,
  ): void;

  /**
   * Sends a renderer-post-console IPC event to the renderer.
   * @param channel - the channel to send the event on
   * @param data - a payload for the renderer-post-console event
   */
  #sendToRenderer(
    channel: 'renderer-post-console',
    data: RendererPostConsoleData,
  ): void;

  /**
   * Sends a renderer-battery-update IPC event to the renderer.
   * @param channel - the channel to send the event on
   * @param data - a payload for the renderer-battery-update event
   */
  #sendToRenderer(
    channel: 'renderer-battery-update',
    data: RendererBatteryUpdateData,
  ): void;

  /**
   * Sends a renderer-latency-update IPC event to the renderer.
   * @param channel - the channel to send the event on
   * @param data - a payload for the renderer-latency-update event
   */
  #sendToRenderer(
    channel: 'renderer-latency-update',
    data: RendererLatencyUpdateData,
  ): void;

  /**
   * Sends a renderer-devices-update IPC event to the renderer.
   * @param channel - the channel to send the event on
   * @param data - a payload for the renderer-devices-update event
   */
  #sendToRenderer(
    channel: 'renderer-devices-update',
    data: RendererDevicesUpdateData,
  ): void;

  /**
   * Typed wrapper function for sending an event to the main window.
   * @param channel - the channel to send the event on
   * @param data - an optional payload for the event
   */
  #sendToRenderer(channel: RendererChannels, data?: any): void {
    if (!this.#mainWindow.isDestroyed()) {
      this.#mainWindow.webContents.send(channel, data);
    }
  }
}

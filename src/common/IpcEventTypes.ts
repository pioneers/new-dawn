import type AppConsoleMessage from './AppConsoleMessage';
import type DeviceInfoState from './DeviceInfoState';
import {
  Mode as RobotRunMode,
  Input as RobotInput,
} from '../../protos-main/protos';

/**
 * IPC event channels used for communication from the main process to the renderer.
 */
export type RendererChannels =
  | 'renderer-init'
  | 'renderer-battery-update'
  | 'renderer-latency-update'
  | 'renderer-devices-update'
  | 'renderer-post-console'
  | 'renderer-file-control'
  | 'renderer-quit-request';

/**
 * IPC event channels used for communication from the renderer to the main process.
 */
export type MainChannels =
  | 'main-file-control'
  | 'main-quit'
  | 'main-update-robot-mode'
  | 'main-connection-config'
  | 'main-robot-input';

/**
 * Data for the renderer-init event, sent when the renderer process has finished initializing and is
 * 'ready-to-show'.
 */
export interface RendererInitData {
  /**
   * User-presentable Dawn version string.
   */
  dawnVersion: string;
  /**
   * The IP address used to communicate with the robot's runtime, retrieved from persistent config.
   */
  robotIPAddress: string;
  /**
   * The IP address of the field controller, retrieved from persistent config.
   */
  fieldIPAddress: string;
  /**
   * The field station number to connect to, retrieved from persistent config.
   */
  fieldStationNumber: string;
  /**
   * Whether the user should be warned when uploading code with unsaved changes in the editor (since
   * these won't be uploaded), retrieved from persistent config.
   */
  showDirtyUploadWarning: boolean;
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * try saving the code and needs to ask the renderer process for the content of the editor.
 */
export interface RendererFileControlPromptSaveData {
  /**
   * The subtype of file control event.
   */
  type: 'promptSave';
  /**
   * Whether the user should be prompted to choose a save path even if one is remembered from the
   * last save or load.
   */
  forceDialog: boolean;
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * try loading a file into the editor and needs to ask the renderer process if this is ok (if there
 * are no unsaved changes).
 */
export interface RendererFileControlPromptLoadData {
  /**
   * The subtype of file control event.
   */
  type: 'promptLoad';
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process has
 * successfully saved the code and the renderer should clear the dirty editor indicator.
 */
export interface RendererFileControlSaveData {
  /**
   * The subtype of file control event.
   */
  type: 'didSave';
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process has
 * successfully loaded code and the renderer should store the retrieved content in the editor.
 */
export interface RendererFileControlOpenData {
  /**
   * The subtype of file control event.
   */
  type: 'didOpen';
  /**
   * The loaded code.
   */
  content: string;
  /**
   * Whether the content has just been read from the save path. False if the code is downloaded and
   * may not match the contents of the save path.
   */
  isCleanFile: boolean;
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process has
 * successfully saved or loaded code and the renderer should update the path shown in the editor.
 */
export interface RendererFileControlPathData {
  /**
   * The subtype of file control event.
   */
  type: 'didChangePath';
  /**
   * The new save path to display in the editor.
   */
  path: string;
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process detects
 * external changes to the currently open file and the renderer should set the dirty editor
 * indicator.
 */
export interface RendererFileControlExtChangeData {
  /**
   * The subtype of file control event.
   */
  type: 'didExternalChange';
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * upload code from the last saved file to the robot and needs to ask the renderer process to notify
 * the user in case this would ignore unsaved changes in the editor.
 */
export interface RendererFileControlPromptUploadData {
  /**
   * The subtype of file control event.
   */
  type: 'promptUpload';
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * download code from the robot into the editor and needs to ask the renderer if this is ok (if
 * there are no unsaved changes).
 */
export interface RendererFileControlPromptDownloadData {
  /**
   * The subtype of file control event.
   */
  type: 'promptDownload';
}

/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * close the file open in the editor.
 */
interface RendererFileControlPromptCreateNewFile {
  type: 'promptCreateNewFile';
}

/**
 * Data for the renderer-file-control event sent by the main process to request or submit
 * information related to the code file and editor.
 */
export type RendererFileControlData =
  | RendererFileControlPromptSaveData
  | RendererFileControlPromptLoadData
  | RendererFileControlSaveData
  | RendererFileControlOpenData
  | RendererFileControlPathData
  | RendererFileControlExtChangeData
  | RendererFileControlPromptUploadData
  | RendererFileControlPromptDownloadData
  | RendererFileControlPromptCreateNewFile;

/**
 * Data for the renderer-post-console event sent by the main process to add a console message to the
 * AppConsole.
 */
export type RendererPostConsoleData = AppConsoleMessage;

/**
 * Data for the renderer-battery-update event sent by the main process to update the robot's battery
 * voltage.
 */
export type RendererBatteryUpdateData = number;

/**
 * Data for the renderer-latency-update event sent by the main process to update the displayed robot
 * connection latency.
 */
export type RendererLatencyUpdateData = number;

/**
 * Data for the renderer-devices-update event sent by the main process to update the state of
 * connected lowcar devices.
 */
export type RendererDevicesUpdateData = DeviceInfoState[];

/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * initiate/respond to a request to save the code.
 */
export interface MainFileControlSaveData {
  /**
   * The subtype of file control event.
   */
  type: 'save';
  /**
   * Whether the user should be prompted to choose a save path even if one is remembered from the
   * last save or load.
   */
  forceDialog: boolean;
  /**
   * The content to save to the file.
   */
  content: string;
}

/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * initiate/authorize a request to load code into the editor.
 */
export interface MainFileControlLoadData {
  /**
   * The subtype of file control event.
   */
  type: 'load';
}

/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * initiate/respond to a request to upload the last opened file to the robot.
 */
export interface MainFileControlUploadData {
  /**
   * The subtype of file control event.
   */
  type: 'upload';
  /**
   * The IP address to connect to via SSH when uploading code.
   */
  robotSSHAddress: string;
}

/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * initiate/respond to a request to download the code on the robot into the editor.
 */
export interface MainFileControlDownloadData {
  /**
   * The subtype of file control event.
   */
  type: 'download';
  /**
   * The IP address to connect to via SSH when uploading code.
   */
  robotSSHAddress: string;
}

/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * inititate/respond to a request to clear the save path (so the next request to save must prompt
 * the user for a new path).
 */
export interface MainFileControlClearSavePathData {
  /**
   * The subtype of file control event.
   */
  type: 'clearSavePath';
}

/**
 * Data for the main-file-control event sent by the renderer process to submit information related
 * to the code file and editor.
 */
export type MainFileControlData =
  | MainFileControlSaveData
  | MainFileControlLoadData
  | MainFileControlUploadData
  | MainFileControlDownloadData
  | MainFileControlClearSavePathData;

/**
 * Data for the main-quit event sent by the renderer both to authorize a request to quit and to send
 * updated configuration data that should be saved before the program closes.
 */
export interface MainQuitData {
  /**
   * Whether the user should be warned when uploading code with unsaved changes in the editor (since
   * these won't be uploaded), to be saved to persistent config.
   */
  showDirtyUploadWarning: boolean;
}

/**
 * Data for the main-update-robot-mode event sent by the renderer to stop the robot or start it with
 * a specified opmode.
 */
export type MainUpdateRobotModeData = RobotRunMode;

/**
 * Data for the main-connection-config event sent by the renderer to notify the main process of a
 * change in the Runtime or field connection config.
 */
export interface MainConnectionConfigData {
  /**
   * The IP address used to communicate with the robot's runtime.
   */
  robotIPAddress: string;
  /**
   * The IP address of the field controller.
   */
  fieldIPAddress: string;
  /**
   * The field station number to connect to.
   */
  fieldStationNumber: string;
}

/**
 * Data for the main-robot-input event sent by the renderer with gamepad or keyboard inputs bound
 * for the robot.
 */
export type MainRobotInputData = RobotInput[];

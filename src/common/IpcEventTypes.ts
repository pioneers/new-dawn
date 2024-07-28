import type AppConsoleMessage from './AppConsoleMessage';

/**
 * Data for the renderer-init event, sent when the renderer process has finished initializing and is
 * 'ready-to-show'.
 */
export interface RendererInitData {
  dawnVersion: string;
  robotIPAddress: string;
  robotSSHAddress: string;
  fieldIPAddress: string;
  fieldStationNumber: string;
}
/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * try saving the code and needs to ask the renderer process for the content of the editor.
 */
interface RendererFcPrmtSaveData {
  type: 'promptSave';
  forceDialog: boolean;
}
/**
 * Data for a specialization of the renderer-file-control event, sent when the main process wants to
 * try loading a file into the editor and needs to ask the renderer process if this is ok (if there
 * are no unsaved changes).
 */
interface RendererFcPrmtLoadData {
  type: 'promptLoad';
}
/**
 * Data for a specialization of the renderer-file-control event, sent when the main process has
 * successfully saved the code and the renderer should clear the dirty editor indicator.
 */
interface RendererFcSaveData {
  type: 'didSave';
}
/**
 * Data for a specialization of the renderer-file-control event, sent when the main process has
 * successfully loaded code and the renderer should store the retrieved content in the editor.
 */
interface RendererFcOpenData {
  type: 'didOpen';
  content: string;
}
/**
 * Data for a specialization of the renderer-file-control event, sent when the main process has
 * successfully saved or loaded code and the renderer should update the path shown in the editor.
 */
interface RendererFcPathData {
  type: 'didChangePath';
  path: string;
}
/**
 * Data for a specialization of the renderer-file-control event, sent when the main process detects
 * external changes to the currently open file and the renderer should set the dirty editor
 * indicator.
 */
interface RendererFcExtChangeData {
  type: 'didExternalChange';
}
/**
 * Data for the renderer-file-control event sent by the main process to request or submit
 * information related to the code file and editor.
 */
export type RendererFileControlData =
  | RendererFcPrmtSaveData
  | RendererFcPrmtLoadData
  | RendererFcSaveData
  | RendererFcOpenData
  | RendererFcPathData
  | RendererFcExtChangeData;
/**
 * Data for the renderer-post-console event sent by the main process to add a console message to the
 * AppConsole.
 */
export type RendererPostConsoleData = AppConsoleMessage;
/**
 * Data for the renderer-robot-update event when some info related to the robot or its connection
 * changes.
 */
export interface RendererRobotUpdateData {
  newRuntimeVersion?: string;
  newRobotBatteryVoltage?: number;
  newRobotLatencyMs?: number;
}

/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * initiate/respond to a request to save the code.
 */
interface MainFcSaveData {
  type: 'save';
  forceDialog: boolean;
  content: string;
}
/**
 * Data for a specialization of the main-file-control event, sent by the renderer to
 * initiate/authorize a request to load code into the editor.
 */
interface MainFcLoadData {
  type: 'load';
}
/**
 * Data for the main-file-control event sent by the renderer process to submit information related
 * to the code file and editor.
 */
export type MainFileControlData = MainFcSaveData | MainFcLoadData;
/**
 * Data for the main-quit event sent by the renderer both to authorize a request to quit and to send
 * updated configuration data that should be saved before the program closes.
 */
export interface MainQuitData {
  robotIPAddress: string;
  robotSSHAddress: string;
  fieldIPAddress: string;
  fieldStationNumber: string;
}

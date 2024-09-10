// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type {
  RendererChannels,
  MainChannels,
  MainFileControlData,
  RendererInitData,
  RendererBatteryUpdateData,
  RendererLatencyUpdateData,
  RendererDevicesUpdateData,
  RendererPostConsoleData,
  RendererFileControlData,
  MainQuitData,
} from '../common/IpcEventTypes';

function sendMessage(channel: 'main-quit', data: MainQuitData): void;
function sendMessage(
  channel: 'main-file-control',
  data: MainFileControlData,
): void;
function sendMessage(channel: MainChannels, data?: any): void {
  ipcRenderer.send(channel, data);
}

function on(
  channel: 'renderer-init',
  func: (arg: RendererInitData) => void,
): () => void;
function on(
  channel: 'renderer-battery-update',
  func: (arg: RendererBatteryUpdateData) => void,
): () => void;
function on(
  channel: 'renderer-latency-update',
  func: (arg: RendererLatencyUpdateData) => void,
): () => void;
function on(
  channel: 'renderer-devices-update',
  func: (arg: RendererDevicesUpdateData) => void,
): () => void;
function on(
  channel: 'renderer-post-console',
  func: (arg: RendererPostConsoleData) => void,
): () => void;
function on(
  channel: 'renderer-file-control',
  func: (arg: RendererFileControlData) => void,
): () => void;
function on(channel: 'renderer-quit-request', func: () => void): () => void;
function on(channel: RendererChannels, func: (arg?: any) => void): () => void {
  const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
    func(...args);
  ipcRenderer.on(channel, subscription);

  return () => {
    ipcRenderer.removeListener(channel, subscription);
  };
}

function once(
  channel: 'renderer-init',
  func: (arg: RendererInitData) => void,
): void;
function once(
  channel: 'renderer-battery-update',
  func: (arg: RendererBatteryUpdateData) => void,
): void;
function once(
  channel: 'renderer-latency-update',
  func: (arg: RendererLatencyUpdateData) => void,
): void;
function once(
  channel: 'renderer-devices-update',
  func: (arg: RendererDevicesUpdateData) => void,
): void;
function once(
  channel: 'renderer-post-console',
  func: (arg: RendererPostConsoleData) => void,
): void;
function once(
  channel: 'renderer-file-control',
  func: (arg: RendererFileControlData) => void,
): void;
function once(channel: 'renderer-quit-request', func: () => void): void;
function once(channel: RendererChannels, func: (arg?: any) => void): void {
  ipcRenderer.once(channel, (_event, ...args) => func(...args));
}

const electronHandler = {
  ipcRenderer: {
    sendMessage,
    on,
    once,
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

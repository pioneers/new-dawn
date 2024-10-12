import { ElectronHandler } from '../main/preload';

declare global {
  /**
   * Electron injections to the renderer global context.
   */
  // eslint-disable-next-line no-unused-vars
  interface Window {
    /**
     * The interface through which Electron renderer processes may communicate with the main
     * process.
     */
    electron: ElectronHandler;
  }
}

export {};

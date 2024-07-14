import { dialog, ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';
import fs from 'fs';
import { version as dawnVersion } from '../../package.json';
import AppConsoleMessage from '../common/AppConsoleMessage';

const WATCH_DEBOUNCE_MS = 3000;
const CODE_FILE_FILTERS = [
  { name: 'Python Files', extensions: ['py'] },
  { name: 'All Files', extensions: ['*'] },
];

export default class MainApp {
  readonly #mainWindow: BrowserWindow;

  #savePath: string | null;

  #watcher: fs.FSWatcher | null;

  #watchDebounce: boolean;

  #preventQuit: boolean;

  constructor(mainWindow: BrowserWindow) {
    this.#mainWindow = mainWindow;
    this.#savePath = null;
    this.#watcher = null;
    this.#watchDebounce = true;
    this.#preventQuit = true;
    mainWindow.on('close', (e) => {
      if (this.#preventQuit) {
        e.preventDefault();
        this.#sendToRenderer('renderer-quit-request');
      }
    });
    ipcMain.on('main-file-control', (_event, data) => {
      if (data.type === 'save') {
        this.#saveCodeFile(data.content as string, data.forceDialog as boolean);
      } else if (data.type === 'load') {
        this.#openCodeFile();
      } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown data.type for main-file-control ${data.type}`);
      }
    });
    ipcMain.on('main-quit', () => {
      this.#preventQuit = false;
      this.#mainWindow.close();
    });
  }

  #sendToRenderer(...args) {
    this.#mainWindow.webContents.send(...args);
  }

  onPresent() {
    this.#watcher?.close();
    this.#savePath = null;
    this.#sendToRenderer('renderer-init', { dawnVersion });
  }

  promptSaveCodeFile(forceDialog: boolean) {
    this.#sendToRenderer('renderer-file-control', {
      type: 'promptSave',
      forceDialog,
    });
  }

  promptLoadCodeFile() {
    this.#sendToRenderer('renderer-file-control', { type: 'promptLoad' });
  }

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
        this.#savePath,
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

  #openCodeFile() {
    const success = this.#showCodePathDialog('load');
    if (success) {
      this.#sendToRenderer('renderer-file-control', {
        type: 'didOpen',
        content: fs.readFileSync(this.#savePath, {
          encoding: 'utf8',
          flag: 'r',
        }),
      });
    }
  }

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
      this.#sendToRenderer('renderer-file-control', {
        type: 'didChangePath',
        path: this.#savePath,
      });
      if (mode === 'load') {
        this.#watchCodeFile();
      }
      return true;
    }
    return false;
  }

  #watchCodeFile() {
    this.#watcher?.close();
    this.#watchDebounce = true;
    this.#watcher = fs.watch(
      this.#savePath,
      { persistent: false, encoding: 'utf8' },
      () => {
        // Don't care what the event type is
        if (this.#watchDebounce) {
          this.#watchDebounce = false;
          setTimeout(() => {
            this.#watchDebounce = true;
          }, WATCH_DEBOUNCE_MS);
          this.#sendToRenderer('renderer-file-control', {
            type: 'didExternalChange',
          });
        }
      },
    );
  }
}

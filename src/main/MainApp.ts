import { dialog, ipcMain } from 'electron';
import type { BrowserWindow, FileFilter } from 'electron';
import fs from 'fs';
import { version as dawnVersion } from '../../package.json';
import AppConsoleMessage from '../common/AppConsoleMessage';

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
 * Manages state owned by the main electron process.
 */
export default class MainApp {
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
   * @param mainWindow - the BrowserWindow.
   */
  constructor(mainWindow: BrowserWindow) {
    this.#mainWindow = mainWindow;
    this.#savePath = null;
    this.#watcher = null;
    this.#watchDebounce = true;
    this.#preventQuit = true;
    mainWindow.on('close', (e) => {
      if (this.#preventQuit) {
        e.preventDefault();
        this.#mainWindow.webContents.send('renderer-quit-request');
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

  /**
   * Lifecycle method to be called when the renderer process has finished initializing. This may
   * happen more than once in the program's lifetime (e.g. if the BrowserWindow is somehow
   * reloaded).
   */
  onPresent() {
    this.#watcher?.close();
    this.#savePath = null;
    this.#mainWindow.webContents.send('renderer-init', { dawnVersion });
  }

  /**
   * Requests that the renderer process start to save the code in the editor.
   * @param forceDialog - whether the save path selection dialog should be shown even if there is
   * a currently opened file that may be saved to.
   */
  promptSaveCodeFile(forceDialog: boolean) {
    // We need a round trip to the renderer because that's where the code in the editor actually
    // lives
    this.#mainWindow.webContents.send('renderer-file-control', {
      type: 'promptSave',
      forceDialog,
    });
  }

  /**
   * Requests that the renderer process start to load code from a file into the editor. The renderer
   * may delay or ignore this request (e.g. if the file currently beind edited is dirty).
   */
  promptLoadCodeFile() {
    this.#mainWindow.webContents.send('renderer-file-control', {
      type: 'promptLoad',
    });
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
            this.#mainWindow.webContents.send(
              'renderer-post-console',
              new AppConsoleMessage(
                'dawn-err',
                `Failed to save code to ${this.#savePath}. ${err}`,
              ),
            );
          } else {
            this.#mainWindow.webContents.send('renderer-file-control', {
              type: 'didSave',
            });
          }
          this.#watchCodeFile();
        },
      );
    }
  }

  /**
   * Tries to load code from a file into the editor. Fails is the user does not choose a path.
   */
  #openCodeFile() {
    const success = this.#showCodePathDialog('load');
    if (success) {
      this.#mainWindow.webContents.send('renderer-file-control', {
        type: 'didOpen',
        content: fs.readFileSync(this.#savePath as string, {
          encoding: 'utf8',
          flag: 'r',
        }),
      });
    }
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
      this.#mainWindow.webContents.send('renderer-file-control', {
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
          this.#mainWindow.webContents.send('renderer-file-control', {
            type: 'didExternalChange',
          });
        }
      },
    );
  }
}

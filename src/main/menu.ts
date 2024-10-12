import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

/**
 * Interface for objects that can handle user input from the menu.
 */
export interface MenuHandler {
  /**
   * Requests that the file open in the editor be closed.
   */
  promptCreateNewCodeFile: () => void;
  /**
   * Requests that a different file is opened in the editor.
   */
  promptLoadCodeFile: () => void;
  /**
   * Requests that the contents of the editor are saved to a file.
   * @param forceDialog - whether the user should be prompted for a save path even if the editor is
   * already associated with an existing file.
   */
  promptSaveCodeFile: (forceDialog: boolean) => void;
  /**
   * Requests that the open file be uploaded to the robot.
   */
  promptUploadCodeFile: () => void;
  /**
   * Requests that student code on the robot be downloaded into the editor.
   */
  promptDownloadCodeFile: () => void;
}

/**
 * Creates an Electron Menu for the appropriate platform and build type.
 */
export default class MenuBuilder {
  /**
   * The handler for menu options related to app logic.
   */
  menuHandler: MenuHandler;

  /**
   * The target window for view-controlling menu options.
   */
  mainWindow: BrowserWindow;

  /**
   * @param menuHandler - menu option handler for options related to app logic.
   * @param mainWindow - target window for view-controlling menu options.
   */
  constructor(menuHandler: MenuHandler, mainWindow: BrowserWindow) {
    this.menuHandler = menuHandler;
    this.mainWindow = mainWindow;
  }

  /**
   * Creates an appropriate Electron menu for the current platform and build type.
   */
  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  /**
   * Called when menu is built and debug tools are enabled.
   */
  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  /**
   * Returns a menu template for the OSX Darwin environment.
   */
  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Electron',
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuFile: DarwinMenuItemConstructorOptions = {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'Command+N',
          click: () => {
            this.menuHandler.promptCreateNewCodeFile();
          },
        },
        {
          label: 'Open',
          accelerator: 'Command+O',
          click: () => {
            this.menuHandler.promptLoadCodeFile();
          },
        },
        {
          label: 'Save',
          accelerator: 'Command+S',
          click: () => {
            this.menuHandler.promptSaveCodeFile(false);
          },
        },
        {
          label: 'Save As',
          accelerator: 'Command+Shift+S',
          click: () => {
            this.menuHandler.promptSaveCodeFile(true);
          },
        },
        { type: 'separator' },
        {
          label: 'Upload open file to robot',
          accelerator: 'Command+Shift+U',
          click: () => {
            this.menuHandler.promptUploadCodeFile();
          },
        },
        {
          label: 'Download code from robot',
          click: () => {
            this.menuHandler.promptDownloadCodeFile();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/main/docs#readme',
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [
      subMenuAbout,
      subMenuFile,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      subMenuHelp,
    ];
  }

  /**
   * Returns a menu template used for environments besides Darwin.
   */
  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&New',
            accelerator: 'Ctrl+N',
            click: () => {
              this.menuHandler.promptCreateNewCodeFile();
            },
          },
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
            click: () => {
              this.menuHandler.promptLoadCodeFile();
            },
          },
          {
            label: '&Save',
            accelerator: 'Ctrl+S',
            click: () => {
              this.menuHandler.promptSaveCodeFile(false);
            },
          },
          {
            label: 'Save &As',
            accelerator: 'Ctrl+Shift+S',
            click: () => {
              this.menuHandler.promptSaveCodeFile(true);
            },
          },
          {
            label: '&Upload open file to robot',
            accelerator: 'Ctrl+Alt+U',
            click: () => {
              this.menuHandler.promptUploadCodeFile();
            },
          },
          {
            label: 'Download code from robot',
            click: () => {
              this.menuHandler.promptDownloadCodeFile();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.DEBUG_PROD === 'true'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen(),
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Ctrl+Shift+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen(),
                    );
                  },
                },
              ],
      },
      /* {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('https://electronjs.org');
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/electron/electron/tree/main/docs#readme',
              );
            },
          },
          {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://www.electronjs.org/community');
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/electron/electron/issues');
            },
          },
        ],
      }, */
    ];

    return templateDefault;
  }
}

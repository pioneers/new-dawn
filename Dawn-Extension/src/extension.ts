import * as vscode from 'vscode';
import CodeTransfer from './CodeTransfer';

// Interface to hold config settings
interface ExtensionSettings {
  port: number
  user: string
  pass: string
  codepath: string
  robotIp: string
}


function getExtensionSettings(): ExtensionSettings {
  const config = vscode.workspace.getConfiguration('dawn-VSCODE');
  const port = config.get<number>("SSHPort");
  const user = config.get<string>("SSHUser")!;
  const pass = config.get<string>("SSHPassword")!;
  const codepath = config.get<string>("CodePath")!;
  const robotIp = config.get<string>('robotIP')!;
  if (!pass) {
    throw new Error("SSH password must not be empty");
  }
  if (!robotIp) {
    throw new Error("Robot IP must be set");
  }
  if (!port) {
    throw new Error("SSH Port must be set");
  }
  if (!user) {
    throw new Error("SSH Username must be set");
  }
  if (!codepath) {
    throw new Error("File Code Path must be set");
  }

  return {
    port: port,
    user: user,
    pass: pass,
    robotIp: robotIp,
    codepath: codepath,
  };
}


// Extension Startup
export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(

    // Command for Upload
    vscode.commands.registerCommand('dawn-VSCODE.UploadRobot', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No file open to upload.');
        return;
      }
      // save any unsave changes
      if (editor.document.isDirty) {
        await editor.document.save();
      }

      const filePath = editor.document.uri.fsPath;
      const settings = getExtensionSettings();
      const codeTransfer = new CodeTransfer(settings.codepath, settings.port, settings.user, settings.pass);

      try {
        await codeTransfer.upload(filePath, settings.robotIp);
        vscode.window.showInformationMessage('Code uploaded successfully.');
      } catch (e) {
        vscode.window.showErrorMessage(`Failed to upload code: ${e}`);
      }
    }),

    // Command for Download
    vscode.commands.registerCommand('dawn-VSCODE.DownloadRobot', async () => {

      const settings = getExtensionSettings();
      const codeTransfer = new CodeTransfer(settings.codepath, settings.port, settings.user, settings.pass);
      let content;
      try {
        content = await codeTransfer.download(settings.robotIp);
      } catch (e) {
        vscode.window.showErrorMessage(`Failed to download code: ${e}`);
        return;
      }
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const doc = editor.document;
        const fullRange = new vscode.Range(
          doc.positionAt(0),
          doc.positionAt(doc.getText().length)
        );

        await editor.edit(editBuilder => {
          editBuilder.replace(fullRange, content);
        });

        await doc.save();

      } else {
        const doc = await vscode.workspace.openTextDocument({
          content,
          language: 'python',
        });
        await vscode.window.showTextDocument(doc);
      }

      vscode.window.showInformationMessage('Code downloaded successfully.');
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() { }

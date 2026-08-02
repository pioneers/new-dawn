import * as vscode from 'vscode';
import CodeTransfer from './CodeTransfer';

// Codetransfer function to get info from settings
function getCodeTransfer(): CodeTransfer | undefined {
  const config = vscode.workspace.getConfiguration('dawn-VSCODE');

  const port = config.get<number>("SSHPort")!;
  const user = config.get<string>("SSHUser")!;
  const pass = config.get<string>("SSHPassword")!;
  let codepath = config.get<string>("CodePath")!;

  if (!pass) {
    vscode.window.showErrorMessage(
      "Set dawn-VSCODE settings before uploading/downloading."
    );
    return undefined;
  }
  codepath = codepath.replace(/\$\{SSHUser\}/g, user);
  return new CodeTransfer(codepath, port, user, pass);
}
  

// take IP address given from setting otherwise default
function getRobotIp(): string | undefined {
  return vscode.workspace.getConfiguration('dawn-VSCODE').get<string>('robotIP');
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

	// Error pop-up for when IP is not setup correctly
	  const ip = getRobotIp();
      if (!ip) {
        vscode.window.showErrorMessage('Set dawn-VSCODE.robotIp in settings first.');
        return;
      }

       const codeTransfer = getCodeTransfer();
      if (!codeTransfer) {
        return;
      }

	  try {
        await codeTransfer.upload(filePath, ip);
        vscode.window.showInformationMessage('Code uploaded successfully.');
      } catch (e) {
        vscode.window.showErrorMessage(`Failed to upload code: ${e}`);
      }
    }),

// Command for Download
	vscode.commands.registerCommand('dawn-VSCODE.DownloadRobot', async () => {

      const ip = getRobotIp();
      if (!ip) {
        vscode.window.showErrorMessage('Set dawn-VSCODE.robotIp in settings first.');
        return;
      }

        const codeTransfer = getCodeTransfer();
      if (!codeTransfer) {
        return;
      }

      try {
        const content = await codeTransfer.download(ip);
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
      } catch (e) {
        vscode.window.showErrorMessage(`Failed to download code: ${e}`);
      }
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';


let originalShowErrorMessage: typeof vscode.window.showErrorMessage;
let capturedMessage: string | undefined;

async function resetConfigToDefaults() {
  const config = vscode.workspace.getConfiguration('dawn-VSCODE');
  await config.update('robotIP', '192.168.0.100', vscode.ConfigurationTarget.Global);
  await config.update('SSHPort', 22, vscode.ConfigurationTarget.Global);
  await config.update('SSHUser', 'ubuntu', vscode.ConfigurationTarget.Global);
  await config.update('SSHPassword', 'potato', vscode.ConfigurationTarget.Global);
  await config.update('CodePath', '/home/ubuntu/runtime/executor/studentcode.py', vscode.ConfigurationTarget.Global);
}

suite('Extension Test', () => {


  setup(async () => {
    await resetConfigToDefaults();
    capturedMessage = undefined;
    originalShowErrorMessage = vscode.window.showErrorMessage;
    (vscode.window as any).showErrorMessage = (message: string) => {
      capturedMessage = message;
    };
  });

  teardown(async () => {
    (vscode.window as any).showErrorMessage = originalShowErrorMessage;
    await resetConfigToDefaults();
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  suite('getExtensionSettings', () => {

    test('returns settings when all config values are present', async () => {
      const result = myExtension.getExtensionSettings();

      assert.deepStrictEqual(result, {
        port: 22,
        user: 'ubuntu',
        pass: 'potato',
        robotIp: '192.168.0.100',
        codepath: '/home/ubuntu/runtime/executor/studentcode.py',
      });
    });

    test('throws when SSH password is missing', async () => {
      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('SSHPassword', '', vscode.ConfigurationTarget.Global);

      assert.throws(
        () => myExtension.getExtensionSettings(),
        /SSH Password must be set correctly/
      );
    });

    test('throws when robot IP is missing', async () => {
      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('robotIP', '', vscode.ConfigurationTarget.Global);

      assert.throws(
        () => myExtension.getExtensionSettings(),
        /Robot IP must be set correctly/
      );
    });

    test('throws when SSH port is missing', async () => {
      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('SSHPort', 0, vscode.ConfigurationTarget.Global);

      assert.throws(
        () => myExtension.getExtensionSettings(),
        /SSH Port must be set correctly/
      );
    });

    test('throws when SSH username is missing', async () => {
      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('SSHUser', '', vscode.ConfigurationTarget.Global);

      assert.throws(
        () => myExtension.getExtensionSettings(),
        /SSH Username must be set correctly/
      );
    });

    test('throws when code path is missing', async () => {
      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('CodePath', '', vscode.ConfigurationTarget.Global);

      assert.throws(
        () => myExtension.getExtensionSettings(),
        /File Code Path must be set correctly/
      );
    });
  });

  suite('UploadRobot command', () => {

    test('shows error when settings are invalid', async () => {
      const tempFilePath = path.join(os.tmpdir(), `dawn-test-${Date.now()}.py`);
      fs.writeFileSync(tempFilePath, 'test');

      const newdoc = await vscode.workspace.openTextDocument(vscode.Uri.file(tempFilePath));
      await vscode.window.showTextDocument(newdoc);

      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('SSHPassword', '', vscode.ConfigurationTarget.Global);

      await vscode.commands.executeCommand('dawn-VSCODE.UploadRobot');
      assert.strictEqual(capturedMessage, 'SSH Password must be set correctly');

      fs.unlinkSync(tempFilePath);
    });
  });

  suite('DownloadRobot command', () => {

    test('shows error when settings are invalid', async () => {
      const config = vscode.workspace.getConfiguration('dawn-VSCODE');
      await config.update('SSHPassword', '', vscode.ConfigurationTarget.Global);

      await vscode.commands.executeCommand('dawn-VSCODE.DownloadRobot');
      assert.strictEqual(capturedMessage, 'SSH Password must be set correctly');
    });

  });

});

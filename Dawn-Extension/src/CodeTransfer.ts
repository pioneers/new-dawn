import { Client as SSHClient } from 'ssh2';
import type { SFTPWrapper as SFTPConnection } from 'ssh2';

/**
 * Transfers code to and from a robot with SFTP.
 */
export default class CodeTransfer {
  /**
   * The path to the code file on the robot.
   */
  readonly #remoteCodePath: string;

  /**
   * Robot SSH port.
   */
  readonly #sshPort: number;

  /**
   * Robot SSH username.
   */
  readonly #sshUser: string;

  /**
   * Robot SSH password.
   */
  readonly #sshPass: string;

  /**
   * @param remoteCodePath - The path to the code file on the robot
   * @param sshPort - the port to use for SSH connections to the robot
   * @param sshUser - the user to log in as for SSH connections to the robot
   * @param sshPass - the password to use for SSH connections to the robot
   */
  constructor(
    remoteCodePath: string,
    sshPort: number,
    sshUser: string,
    sshPass: string,
  ) {
    this.#remoteCodePath = remoteCodePath;
    this.#sshPort = sshPort;
    this.#sshUser = sshUser;
    this.#sshPass = sshPass;
  }

  /**
   * Uploads the contents of a local file to the robot.
   * @param localCodePath - the path of the local file to upload
   * @param ip - the IP of the robot to connect to via SSH
   * @returns A Promise that resolves when the upload is complete.
   */
  upload(localCodePath: string, ip: string): Promise<null> {
    return this.#doSftp(ip, (sftp, resolve, reject) => {
      sftp.fastPut(
        localCodePath,
        this.#remoteCodePath,
        (err: Error | undefined | null) => {
          if (err) {
            reject(
              new Error('SFTP fastPut error when uploading student code.', {
                cause: err,
              }),
            );
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  /**
   * Fetches the contents of the code file on the robot.
   * @param ip - the IP of the robot to connect to via SSH
   * @returns A Promise that resolves with the content of the file.
   */
  download(ip: string): Promise<string> {
    return this.#doSftp(ip, (sftp, resolve, reject) => {
      let buffer = '';
      sftp
        .createReadStream(this.#remoteCodePath, { encoding: 'utf8' })
        .on('error', (err: Error) => {
          reject(
            new Error('SFTP read stream error when downloading student code.', {
              cause: err,
            }),
          );
        })
        .on('data', (chunk: string) => {
          buffer += chunk;
        })
        .on('end', () => {
          resolve(buffer);
        });
    });
  }

  /**
   * Opens an SSH connection and starts an SFTP session, then executes a callback.
   * @param ip - the IP of the robot to connect to via SSH
   * @returns A Promise created from the callback.
   */
  #doSftp<T>(
    ip: string,
    /**
     * a function to call during the created SFTP session
     * @param sftp - the SFTP session handle
     * @param resolve - function to resolve the returned Promise, optionally with some data
     * @param reject - function to reject the returned Promise
     */
    callback: (
      sftp: SFTPConnection,
      resolve: (data: T) => void,
      reject: (err: Error) => void,
    ) => void,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const client = new SSHClient();
      client
        .on('error', (err: Error) => {
          reject(
            new Error('SSH connection error when transmitting student code.', {
              cause: err,
            }),
          );
        })
        .on('ready', () => {
          client.sftp((err: Error | undefined, sftp: SFTPConnection) => {
            if (err) {
              reject(
                new Error(
                  'SFTP connection error when transmitting student code.',
                  { cause: err },
                ),
              );
            } else {
              callback(sftp, resolve, reject);
            }
          });
        })
        .connect({
          host: ip,
          port: this.#sshPort,
          username: this.#sshUser,
          password: this.#sshPass,
        });
    });
  }
}

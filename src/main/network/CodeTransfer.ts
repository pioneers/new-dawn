import { Client as SSHClient } from 'ssh2';
import type { SFTPWrapper as SFTPConnection } from 'ssh2';

export default class CodeTransfer {
  readonly #remoteCodePath: string;

  readonly #sshPort: number;

  readonly #sshUser: string;

  readonly #sshPass: string;

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

  #doSftp<T>(
    ip: string,
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
            new Error('SSH connection error when uploading student code.', {
              cause: err,
            }),
          );
        })
        .on('ready', () => {
          client.sftp((err: Error | undefined, sftp: SFTPConnection) => {
            if (err) {
              reject(
                new Error(
                  'SFTP connection error when uploading student code.',
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

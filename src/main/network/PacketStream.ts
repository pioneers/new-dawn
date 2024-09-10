import { Transform, TransformCallback, TransformOptions } from 'stream';

/**
 * Length of a packet header in bytes: 1 byte type, 2 byte unsigned LE packet length.
 */
const HEADER_LENGTH = 3;

/**
 * Transform stream that splits a stream into Runtime packets: { type: number; data: Buffer }.
 */
export default class PacketStream extends Transform {
  #buf: Buffer[];
  #bufLen: number;

  constructor(options?: TransformOptions) {
    if (options && (options.writableObjectMode || options.objectMode)) {
      throw new Error('PacketStream does not support writable object mode.');
    }
    super({
      readableObjectMode: true,
      ...(options || {}),
    });
    this.#buf = [];
    this.#bufLen = 0;
  }
  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    let chunkBuf: Buffer;
    if (chunk instanceof Buffer) {
      chunkBuf = chunk;
    } else if (typeof chunk === 'string') {
      chunkBuf = Buffer.from(chunk, encoding);
    } else {
      throw new Error('PacketStream does not support writable object mode.');
    }
    this.#buf.push(chunkBuf);
    let shouldConcatHeader = this.#bufLen < HEADER_LENGTH;
    this.#bufLen += chunkBuf.byteLength;
    while (this.#tryReadPacket(shouldConcatHeader)) {
      shouldConcatHeader = false;
    }
  }
  #tryReadPacket(shouldConcatHeader: boolean) {
    if (this.#bufLen < HEADER_LENGTH) {
      // Wait for complete header before reading packet
      return false;
    }
    if (shouldConcatHeader) {
      // Concat buffer in case the header is in multiple chunks, but only do this once per packet
      this.#buf = [Buffer.concat(this.#buf)];
    }
    const packetType = this.#buf[0].readUInt8(0);
    const packetLength = this.#buf[0].readUInt16LE(1);
    if (this.#bufLen < HEADER_LENGTH + packetLength) {
      // Wait for complete packet data before reading packet
      return false;
    }
    this.#buf[0] = this.#buf[0].subarray(HEADER_LENGTH); // Trim off header
    this.#buf = [Buffer.concat(this.#buf)]; // Get packet data in one Buffer
    this.push({ type: packetType, data: this.#buf[0].subarray(0, packetLength) });
    this.#buf[0] = this.#buf[0].subarray(packetLength); // Trim off packet data
    this.#bufLen -= HEADER_LENGTH + packetLength;
    return true; // Packet successfully read, more may follow
  }
}

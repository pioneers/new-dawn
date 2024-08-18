import { randomUUID } from 'crypto';

/**
 * A type of AppConsoleMessage.
 */
export type MessageType = 'dawn-err' | 'dawn-info' | 'robot-err' | 'robot-info';

/**
 * Represents a formatted message in the AppConsole.
 */
export default class AppConsoleMessage {
  /**
   * The type of the message.
   */
  readonly type: MessageType;

  /**
   * The text content of the message.
   */
  readonly text: string;

  /**
   * The unique id of the message for use by React.
   */
  readonly uuid: string;

  /**
   * @param type - the type of the message
   * @param text - the text content of the message
   */
  constructor(type: MessageType, text: string) {
    this.type = type;
    this.text = text;
    this.uuid = randomUUID();
  }
}

/**
 * A type of AppConsoleMessage.
 */
export type MessageType = 'dawn-err' | 'robot-err' | 'robot-info';

/**
 * Represents a formatted message in the AppConsole.
 */
export default class AppConsoleMessage {
  /**
   * The type of the message.
   */
  #type: MessageType;

  /**
   * The text content of the message.
   */
  #text: string;

  /**
   * @param type - the type of the message
   * @param text - the text content of the message
   */
  constructor(type: MessageType, text: string) {
    this.#type = type;
    this.#text = text;
  }
}

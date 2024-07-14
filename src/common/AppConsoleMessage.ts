export default class AppConsoleMessage {
  #type: string;

  #text: string;

  constructor(type: string, text: string) {
    this.#type = type;
    this.#text = text;
  }
}

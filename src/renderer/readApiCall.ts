import { Ace, require as acequire } from 'ace-builds';

const { TokenIterator } = acequire('ace/token_iterator');

/**
 * Reads a string that looks like an API call just before the given position in the editor.
 * An "API call" may include parentheses used to call a function, periods, identifier characters,
 * and whitespace before and after non-identifiers. Tokens the Ace tokenizer considers to be part of
 * a string in the editor's current mode also delimit an API call. Comments and line breaks around
 * non-identifiers are ignored, and string collections continues on the other side of the comment.
 * Probably mode-independent, though it hasn't been tested on anything besides Python.
 * @param session - the Ace editing session to use to read the editor contents.
 * @param pos - the position to start reading behind.
 * @param minLength - the minimum length in characters of text to read. A whole number of tokens
 * will always be read, but reading is stopped after reading at least this many characters.
 * @return The text of the read "API call", which may be an empty string if the first token before
 * pos is not part of an API call.
 */
export default (
  session: Ace.EditSession,
  pos: Ace.Position,
  minLength: number,
): string => {
  const iter = new TokenIterator(session, pos.row, pos.column);
  let token = iter.getCurrentToken();
  const tokenIsIdent = () =>
    ['identifier', 'function.support'].includes(token.type);
  const firstToken = token;
  while (token === undefined || token.value.trim() === '') {
    token = iter.stepBackward();
    if (token === null) {
      return '';
    }
  }
  if (token.type === 'comment' || token.type === 'string') {
    return '';
  }
  let lastWasIdentifier = tokenIsIdent();
  let buf = token.value.trim();
  let posInBuf;
  if (token === firstToken) {
    posInBuf = pos.column - iter.getCurrentTokenColumn();
  } else {
    posInBuf = buf.length;
  }
  buf = buf.slice(0, posInBuf);
  while (buf.length < minLength) {
    token = iter.stepBackward();
    if (token === null) {
      break;
    }
    const tokenIsWhitespace = token.value.trim() === '';
    // The following conditions cause a token break if coming before an identifier:
    const preIdentBreak =
      tokenIsIdent() ||
      token.type.startsWith('paren') ||
      token.type === 'string' ||
      (token.type === 'punctuation' && !token.value.includes('.'));
    if (lastWasIdentifier && preIdentBreak) {
      break;
    }
    if (token.type !== 'comment') {
      buf = token.value.trim() + buf;
      posInBuf += token.value.trim().length;
      if (!tokenIsWhitespace) {
        lastWasIdentifier = tokenIsIdent();
      }
    }
  }
  return buf;
};

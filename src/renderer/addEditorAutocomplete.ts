import { Ace, require as acequire } from 'ace-builds';
import robotKeyNumberMap from './robotKeyNumberMap';

const { TokenIterator } = acequire('ace/token_iterator');

/**
 * Adds PiE API completers to the given editor.
 * @param editor - the editor to modify
 */
export default function addEditorAutocomplete(editor: Ace.Editor) {
  const COMP_SCORE = 200; // Override 'local' completions
  const globalCompleter = {
    getCompletions: (
      _editor: Ace.Editor,
      _session: Ace.EditSession,
      _pos: Ace.Point,
      _prefix: string,
      callback: Ace.CompleterCallback,
    ) => {
      callback(
        null,
        ['Robot', 'Keyboard', 'Gamepad'].map((value) => ({
          value,
          meta: 'PiE API',
          score: COMP_SCORE - 10,
        })),
      );
    },
  };
  /**
   * Creates a completer that only shows its completions when the tokens around the caret
   * match one of the given lastToken strings.
   * @param ctx - the string to match the current and previous tokens against. $ is
   * interpreted as the position of the caret in the current token. If ommitted, the matching caret
   * position is assumed to be at the end. Any occurrences of $ in lastToken strings are removed
   * from the match.
   * @param completions - the array of completions to show if the tokens around the caret are
   * matched with one of the lastToken strings. Characters before the first occurrence of $ in the
   * value property of a completion and after the second are intrepreted as optional. A leading
   * sequence of optional prefix characters and trailing sequence of optional suffix characters
   * around the caret are removed from the completion. If ommitted, no part of the completion value
   * is considered optional. Any occurrences of $ in completion values are removed.
   * @return The created completer.
   */
  const makeContextCompleter = (
    ctx: string,
    completions: string[],
  ) => {
    return {
      getCompletions: (
        _editor: Ace.Editor,
        session: Ace.EditSession,
        pos: Ace.Point,
        _prefix: string,
        callback: Ace.CompleterCallback,
      ) => {
        const iter = new TokenIterator(session, pos.row, pos.column);
        let token = iter.getCurrentToken();
        const tokenIsIdent = () => ['identifier', 'function.support'].includes(token.type);
        const firstToken = token;
        let canPartialComplete = true;
        while (token === undefined || token.value.trim() === '') {
          canPartialComplete = false;
          token = iter.stepBackward();
          if (token === null) {
            return;
          }
        }
        if (token.type === 'comment') {
          return;
        }
        let lastWasIdentifier = tokenIsIdent();
        if (iter.getCurrentTokenRow() !== pos.row) {
          canPartialComplete = false;
        }
        let buf = token.value;
        let posInBuf;
        if (token === firstToken) {
          posInBuf = pos.column - iter.getCurrentTokenColumn();
        } else {
          posInBuf = buf.length;
        }
        const maxLength = ctx.length + Math.max(
          ...completions.map(completion => completion.length)
        );
        while (buf.length < maxLength) {
          token = iter.stepBackward();
          if (token === null) {
            break;
          }
          if (lastWasIdentifier && (tokenIsIdent() || token.value.trim() !== token.value)) {
            break;
          }
          if (token.type === 'comment' || token.value.trim() === '') {
            // Whitespace-only check looks redundant because nothing would be added to buf or
            // posInBuf, but lastWasIdentifier assignment must be skipped
            canPartialComplete = false;
            continue;
          }
          buf = token.value.trim() + buf;
          posInBuf += token.value.trim().length;
          lastWasIdentifier = tokenIsIdent();
        }
        const beforeCaret = buf.slice(0, posInBuf);
        const isContext = beforeCaret.startsWith(ctx);
        callback(null, isContext ? completions
          .filter(completion => canPartialComplete
            ? ((ctx + completion).startsWith(beforeCaret))
            : (ctx === beforeCaret))
          .map(caption => {
            return {
              caption,
              // FIXME
              // Completion is multiple tokens (e.g. Gamepad.get_value completions): slice is needed
              // to remove already-typed string from completion.
              // Context is single token: unsliced is needed or else existing text is replaced with
              // sliced completion, effectively deleting the already-typed bit.
              //value: caption.slice(beforeCaret.length - ctx.length),
              value: caption,
              meta: 'PiE API',
              score: COMP_SCORE,
            };
          }) : []
        );
      },
    };
  };
  /**
   * Wraps a completer so it does not trigger if the current or preceeding token is a dot.
   * @param completer - the completer to wrap.
   * @return The wrapped completer.
   */
  const adaptGlobalCompleter = (completer: Ace.Completer) => ({
    getCompletions: (
      _editor: Ace.Editor,
      session: Ace.EditSession,
      pos: Ace.Point,
      prefix: string,
      callback: Ace.CompleterCallback,
    ) => {
      const iter = new TokenIterator(session, pos.row, pos.column);
      const curTokenDot =
        iter.getCurrentToken() !== undefined &&
        iter.getCurrentToken().value === '.';
      const prevTokenDot =
        iter.stepBackward() !== null && iter.getCurrentToken().value === '.';
      if (!curTokenDot && !prevTokenDot) {
        completer.getCompletions(editor, session, pos, prefix, callback);
      }
    },
  });

  editor.commands.addCommand({
    name: 'dotAutoComplete',
    bindKey: {
      win: '.',
      mac: '.',
    },
    exec: () => {
      editor.insert('.');
      editor.execCommand('startAutocomplete');
    },
  });
  editor.commands.addCommand({
    name: 'parenAutoComplete',
    bindKey: {
      win: '(',
      mac: '(',
    },
    exec: () => {
      editor.insert('(');
      editor.execCommand('startAutocomplete');
    },
  });
  editor.completers = [
    adaptGlobalCompleter(globalCompleter),
    makeContextCompleter(
      'Robot.',
      [
        'get_value',
        'set_value',
        'start_pos',
        'sleep',
        'log',
        'is_running',
        'run',
      ],
    ),
    makeContextCompleter(
      'Gamepad.',
      ['available', 'get_value'],
    ),
    makeContextCompleter(
      'Gamepad.get_value(',
      [
        '"button_a"',
        '"button_b"',
        '"button_x"',
        '"button_y"',
        '"l_bumper"',
        '"r_bumper"',
        '"l_trigger"',
        '"r_trigger"',
        '"button_back"',
        '"button_start"',
        '"l_stick"',
        '"r_stick"',
        '"dpad_up"',
        '"dpad_down"',
        '"dpad_left"',
        '"dpad_right"',
        '"button_xbox"',
      ],
    ),
    makeContextCompleter(
      'Keyboard.',
      ['available', 'get_value'],
    ),
    makeContextCompleter(
      'Keyboard.get_value(',
      Object.keys(robotKeyNumberMap).map(c => `"${c}"`),
    ),
    ...editor.completers.map(adaptGlobalCompleter),
  ];
}

import { Ace, require as acequire } from 'ace-builds';
import robotKeyNumberMap from './robotKeyNumberMap';

const AceTokenIterator = acequire('ace/token_iterator').TokenIterator;

/**
 * Adds PiE API completers to the given editor.
 * @param editor - the editor to modify
 */
export default function addEditorAutocomplete(editor: Ace.Editor) {
  const compScore = 1; // Override 'local' completions
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
          score: compScore,
        })),
      );
    },
  };
  /**
   * Creates a completer that only shows its completions when the tokens around the caret
   * match one of the given lastToken strings.
   * @param lastTokens - the array of strings to match the current and previous tokens against. $ is
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
    lastTokens: string[],
    completions: Ace.Completion[],
  ) => ({
    getCompletions: (
      _editor: Ace.Editor,
      session: Ace.EditSession,
      pos: Ace.Point,
      _prefix: string,
      callback: Ace.CompleterCallback,
    ) => {
      const iter = new AceTokenIterator(session, pos.row, pos.column);
      const firstToken = iter.getCurrentToken();
      if (firstToken === undefined || firstToken.type === 'comment') {
        return;
      }
      let buf = firstToken.value.trim();
      let positionInLastTokens = buf.length;
      const maxLength = Math.max(...lastTokens.map((s) => s.length));
      while (iter.stepBackward() !== null && buf.length < maxLength) {
        const token = iter.getCurrentToken();
        if (token.type !== 'comment') {
          const tokenStr = token.value.trim();
          buf = tokenStr + buf;
          positionInLastTokens += tokenStr.length;
        }
      }
      const isContext = lastTokens
        .map((s) => {
          const caretLoc = s.indexOf('$') === -1 ? s.length : s.indexOf('$');
          const replaced = s.replace('$', '');
          return positionInLastTokens === caretLoc && buf.endsWith(replaced);
        })
        .includes(true);
      callback(null, isContext ? completions : []);
    },
  });
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
      const iter = new AceTokenIterator(session, pos.row, pos.column);
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
      ['Robot', 'Robot.'],
      [
        'get_value',
        'set_value',
        'start_pos',
        'sleep',
        'log',
        'is_running',
        'run',
      ].map((value) => ({
        value,
        meta: 'PiE API',
        score: compScore,
      })),
    ),
    makeContextCompleter(
      ['Gamepad', 'Gamepad.'],
      ['available', 'get_value'].map((value) => ({
        value,
        meta: 'PiE API',
        score: compScore,
      })),
    ),
    makeContextCompleter(
      ['Gamepad.get_value(', 'Gamepad.get_value($)'],
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
      ].map((value) => ({
        value,
        meta: 'PiE API',
        score: compScore,
      })),
    ),
    makeContextCompleter(
      ['Keyboard', 'Keyboard.'],
      ['available', 'get_value'].map((value) => ({
        value,
        meta: 'PiE API',
        score: compScore,
      })),
    ),
    makeContextCompleter(
      ['Keyboard.get_value(', 'Keyboard.get_value($)'],
      Object.keys(robotKeyNumberMap).map((value) => ({
        value: `"${value}"`,
        meta: 'PiE API',
        score: compScore,
      })),
    ),
    ...editor.completers.map(adaptGlobalCompleter),
  ];
}

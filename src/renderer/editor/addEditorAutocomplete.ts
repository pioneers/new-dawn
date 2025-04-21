import { Ace, require as acequire } from 'ace-builds';
import robotKeyNumberMap from '../robotKeyNumberMap';
import readApiCall from './readApiCall';

const { TokenIterator } = acequire('ace/token_iterator');

/**
 * The base score to give to our added completions. Set at this value to override Ace's default
 * keyword and 'local' variable completions.
 */
const COMP_SCORE = 200;

/**
 * Completer for PiE globals.
 */
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
 * Creates a completer that only shows its completions when the tokens before the caret
 * match one of the given strings.
 * @param ctx - the string to match the tokens before the caret against. Be advised that this is
 * only designed to support function calls; parenthese used outside function calls, braces, spaces
 * between identifiers, and any kind of punctuation other than periods will never be matched.
 * @param completions - the array of completions to show if the tokens around the caret are
 * matched with one of the lastToken strings.
 * @return The created completer.
 */
function makeContextCompleter(ctx: string, completions: string[]) {
  return {
    getCompletions: (
      _editor: Ace.Editor,
      session: Ace.EditSession,
      pos: Ace.Point,
      _prefix: string,
      callback: Ace.CompleterCallback,
    ) => {
      const maxLength =
        ctx.length +
        Math.max(...completions.map((completion) => completion.length));
      const buf = readApiCall(session, pos, maxLength);
      const isContext = buf.startsWith(ctx);
      callback(
        null,
        isContext
          ? completions
              .filter(
                (completion) =>
                  (ctx + completion).startsWith(buf.trim()) &&
                  ctx + completion !== buf.trim(),
              )
              .map((caption) => {
                return {
                  caption,
                  // FIXME
                  // Completion is multiple tokens (e.g. Gamepad.get_value completions): slice is needed
                  // to remove already-typed string from completion.
                  // Context is single token: unsliced is needed or else existing text is replaced with
                  // sliced completion, effectively deleting the already-typed bit.
                  // value: caption.slice(buf.length - ctx.length),
                  value: caption,
                  meta: 'PiE API',
                  score: COMP_SCORE,
                };
              })
          : [],
      );
    },
    onInsert: (_editor: Ace.Editor, _completion: Ace.Completion) => {
      // Adding something over here could maybe fix sliced completion?
    },
  };
}

/**
 * Wraps a completer so it does not trigger if the current or preceeding token contains a dot.
 * @param completer - the completer to wrap.
 * @return The wrapped completer.
 */
function adaptGlobalCompleter(completer: Ace.Completer) {
  return {
    getCompletions: (
      editor: Ace.Editor,
      session: Ace.EditSession,
      pos: Ace.Point,
      prefix: string,
      callback: Ace.CompleterCallback,
    ) => {
      const iter = new TokenIterator(session, pos.row, pos.column);
      const curTokenDot =
        iter.getCurrentToken() !== undefined &&
        iter.getCurrentToken().value &&
        iter.getCurrentToken().value.includes('.');
      const prevTokenDot =
        iter.stepBackward() !== null &&
        iter.getCurrentToken().value &&
        iter.getCurrentToken().value.includes('.');
      if (!curTokenDot && !prevTokenDot) {
        completer.getCompletions(editor, session, pos, prefix, callback);
      }
    },
  };
}

/**
 * Adds PiE API completers to the given editor.
 * @param editor - the editor to modify
 */
export default function addEditorAutocomplete(editor: Ace.Editor) {
  console.dir(editor);
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
    makeContextCompleter('Robot.', [
      'get_value',
      'set_value',
      'start_pos',
      'sleep',
      'log',
      'is_running',
      'run',
    ]),
    makeContextCompleter('Gamepad.', ['available', 'get_value']),
    makeContextCompleter('Gamepad.get_value(', [
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
    ]),
    makeContextCompleter('Keyboard.', ['available', 'get_value']),
    makeContextCompleter(
      'Keyboard.get_value(',
      Object.keys(robotKeyNumberMap).map((c) => `"${c}"`),
    ),
    ...(editor.completers || []).map(adaptGlobalCompleter),
  ];
}

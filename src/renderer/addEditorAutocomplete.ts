import { Ace, acequire } from 'ace-builds';

const AceTokenIterator = acequire('ace/token_iterator').TokenIterator;

export default function addEditorAutocomplete(editor: Ace.Editor) {
  const compScore = 1; // Override 'local' completions
  const globalCompleter = {
    getCompletions: (_editor: Ace.Editor, _session: Ace.EditSession, _pos: Ace.Point, _prefix: string, callback: Ace.CompleterCallback) => {
      callback(null, [
        {
          value: 'Robot',
          meta: 'PiE API',
          score: compScore,
        },
        {
          value: 'Keyboard',
          meta: 'PiE API',
          score: compScore,
        },
        {
          value: 'Gamepad',
          meta: 'PiE API',
          score: compScore,
        },
      ]);
    }
  };
  // $ is interpreted as caret location. If not present, assumed to be at end
  const makeContextCompleter = (lastTokens: string[], completions: Ace.Completion[]) => ({
    getCompletions: (_editor: Ace.Editor, session: Ace.EditSession, pos: Ace.Point, _prefix: string, callback: Ace.CompleterCallback) => {
      const iter = new AceTokenIterator(session, pos.row, pos.column);
      let buf = '';
      const curToken = iter.getCurrentToken() || null;
      let positionInLastTokens = curToken && curToken.start !== undefined ? pos.column - curToken.start : 0;
      console.log(curToken, curToken, curToken.start !== undefined, positionInLastTokens);
      const maxLength = lastTokens.map(s => s.length).reduce(Math.max);
      while (iter.stepBackward() !== null && buf.length < maxLength) {
        const token = iter.getCurrentToken();
        if (token.type !== 'comment') {
          buf = token.value.trim() + buf;
          positionInLastTokens += buf.length;
        }
      }
      const isContext = lastTokens.map(s => {
        const caretLoc = s.indexOf('$') === -1 ? s.length : s.indexOf('$');
        const replaced = s.replace('$', '');
        return positionInLastTokens == caretLoc && buf.endsWith(replaced);
      }).includes(true);
      callback(null, isContext ? completions : []);
    }
  });
  const adaptGlobalCompleter = (completer: Completer) => ({
    getCompletions: (editor: Ace.Editor, session: Ace.EditSession, pos: Ace.Point, prefix: string, callback: Ace.CompleterCallback) => {
      const iter = new AceTokenIterator(session, pos.row, pos.column);
      const curTokenDot = iter.getCurrentToken() !== undefined && iter.getCurrentToken().value === '.';
      const prevTokenDot = iter.stepBackward() !== null && iter.getCurrentToken().value === '.';
      callback(null, curTokenDot || prevTokenDot ? [] : completer.getCompletions(editor, session, pos, prefix, callback));
    }
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
    }
  });
  editor.completers = [
    adaptGlobalCompleter(globalCompleter),
    makeContextCompleter(['Robot', 'Robot.'], [
      {
        value: 'get_value',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'set_value',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'start_pos',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'sleep',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'log',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'is_running',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'run',
        meta: 'PiE API',
        score: compScore,
      },
    ]),
    makeContextCompleter(['Gamepad', 'Gamepad.'], [
      {
        value: 'available',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'get_value',
        meta: 'PiE API',
        score: compScore,
      },
    ]),
    makeContextCompleter(['Gamepad.get_value(', 'Gamepad.get_value($)'], [
      {
        value: '"button_a"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"button_b"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"button_x"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"button_y"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"l_bumper"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"r_bumper"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"l_trigger"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"r_trigger"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"button_back"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"button_start"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"l_stick"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"r_stick"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"dpad_up"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"dpad_down"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"dpad_left"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"dpad_right"',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: '"button_xbox"',
        meta: 'PiE API',
        score: compScore,
      },
    ]),
    makeContextCompleter(['Keyboard', 'Keyboard.'], [
      {
        value: 'available',
        meta: 'PiE API',
        score: compScore,
      },
      {
        value: 'get_value',
        meta: 'PiE API',
        score: compScore,
      },
    ]),
    makeContextCompleter(['Keyboard.get_value(', 'Keyboard.get_value($)'], [

    ]),
    ...editor.completers.map(adaptGlobalCompleter),
  ];
}

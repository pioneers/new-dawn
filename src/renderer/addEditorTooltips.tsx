import { Ace, require as acequire } from 'ace-builds';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import readApiCall from './readApiCall';

const { HoverTooltip } = acequire('ace/tooltip');
const { TokenIterator } = acequire('ace/token_iterator');

const apiHelpComponents: {
  [matchText: string]: () => ReactNode;
} = {
  'Robot.get_value': () => (
    <div>
      Documentation for Robot.get_value method.
    </div>
  ),
  'Robot': () => (
    <div>
      Documentation for Robot object.
    </div>
  ),
};

export default function addEditorTooltips(editor: Ace.Editor) {
  const tooltip = new HoverTooltip();
  const node = document.createElement('div');
  const root = createRoot(node);
  const maxMatchTextLength = Math.max(...Object.keys(apiHelpComponents).map(s => s.length));
  tooltip.setDataProvider((event: any, _editor: Ace.Editor) => {
    const pos: Ace.Position = event.getDocumentPosition();
    const range = editor.session.getWordRange(pos.row, pos.column);
    const result = readApiCall(editor.getSession(), range.end, maxMatchTextLength);
    if (!result.isInterrupted && result.text in apiHelpComponents) {
      root.render(apiHelpComponents[result.text]());
      tooltip.showForRange(editor, range, node, event);
    }
  });
  tooltip.addToEditor(editor);
}

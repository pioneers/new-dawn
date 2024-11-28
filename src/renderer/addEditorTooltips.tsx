import { Ace, require as acequire } from 'ace-builds';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import readApiCall from './readApiCall';

const { HoverTooltip } = acequire('ace/tooltip');

const apiHelpComponents: {
  [matchText: string]: () => ReactNode;
} = {
  'Robot.get_value': () => <div>Documentation for Robot.get_value method.</div>,
  Robot: () => <div>Documentation for Robot object.</div>,
};

/**
 * Configures hover tooltips for PiE API stuff in the given editor.
 * @param editor - the editor to modify
 */
export default function addEditorTooltips(editor: Ace.Editor) {
  const tooltip = new HoverTooltip();
  const node = document.createElement('div');
  const root = createRoot(node);
  // Check just past longest match in case the very next character
  const maxMatchTextLength =
    Math.max(...Object.keys(apiHelpComponents).map((s) => s.length)) + 1;
  tooltip.setDataProvider((event: any, _editor: Ace.Editor) => {
    const pos: Ace.Position = event.getDocumentPosition();
    const range = editor.session.getWordRange(pos.row, pos.column);
    const result = readApiCall(editor.session, range.end, maxMatchTextLength);
    if (result in apiHelpComponents) {
      root.render(apiHelpComponents[result]());
      tooltip.showForRange(editor, range, node, event);
    }
  });
  tooltip.addToEditor(editor);
}

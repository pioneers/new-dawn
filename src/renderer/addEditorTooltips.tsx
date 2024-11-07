import { Ace, require as acequire } from 'ace-builds';

const { HoverTooltip } = acequire('ace/tooltip');
const { TokenIterator } = acequire('ace/token_iterator');

export default function addEditorTooltips(editor: Ace.Editor) {
  const tooltip = new HoverTooltip();
  tooltip.setDataProvider((event, _editor) => {
    // Call this somewhere:
    tooltip.showForRange(editor, range, node, event);
  });
  tooltip.addToEditor(editor);
}

import { Ace, require as acequire } from 'ace-builds';
import { createRoot } from 'react-dom/client';

const { HoverTooltip } = acequire('ace/tooltip');
const { TokenIterator } = acequire('ace/token_iterator');

export default function addEditorTooltips(editor: Ace.Editor) {
  const tooltip = new HoverTooltip();
  tooltip.setDataProvider((event, _editor) => {
    const pos = event.getDocumentPosition();
    const range = editor.session.getWordRange(pos.row, pos.column);
    const node = document.createElement('div');
    const root = createRoot(node);
    root.render(
      <span>Hello world!</span>
    );
    const observer = new MutationObserver((_mutations) => {
      if (!document.contains(node)) {
        observer.disconnect();
        root.unmount();
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
    tooltip.showForRange(editor, range, node, event);
  });
  tooltip.addToEditor(editor);
}

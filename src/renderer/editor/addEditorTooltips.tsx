import { Ace, require as acequire } from 'ace-builds';
import { createRoot } from 'react-dom/client';
import readApiCall from './readApiCall';
import apiDocs from '../docs/apiDocs';
import type { DocsRef } from '../docs/ApiLink';

const { HoverTooltip } = acequire('ace/tooltip');

const API_PREFIX = 'api/';

/**
 * Configures hover tooltips for PiE API stuff in the given editor.
 * @param editor - the editor to modify
 * @param onShowHelpModal - the callback to call to show the help modal.
 */
export default function addEditorTooltips(
  editor: Ace.Editor,
  onShowHelpModal: () => void,
  docsRef: DocsRef
) {
  const tooltip = new HoverTooltip();
  const node = document.createElement('div');
  const root = createRoot(node);
  const maxMatchTextLength =
    Math.max(...Object.keys(apiDocs)
      .filter((s) => s.startsWith(API_PREFIX))
      .map((s) => s.length - API_PREFIX.length)
    ) + 1; // Check just past longest match in case the very next character is not a call boundary
  tooltip.setDataProvider((event: any, _editor: Ace.Editor) => {
    const pos: Ace.Position = event.getDocumentPosition();
    const range = editor.session.getWordRange(pos.row, pos.column);
    const result = API_PREFIX + readApiCall(editor.session, range.end, maxMatchTextLength);
    if (result in apiDocs) {
      root.render(apiDocs[result].component(onShowHelpModal, docsRef));
      tooltip.showForRange(editor, range, node, event);
    }
  });
  tooltip.addToEditor(editor);
}

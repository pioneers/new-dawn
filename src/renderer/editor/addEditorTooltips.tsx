import { Ace, require as acequire } from 'ace-builds';
import type { RefObject } from 'react';
import { createRoot } from 'react-dom/client';
import readApiCall from './readApiCall';
import apiHelpComponents from '../docs/apiDocs';

const { HoverTooltip } = acequire('ace/tooltip');

const API_PREFIX = 'api/';

/**
 * Configures hover tooltips for PiE API stuff in the given editor.
 * @param editor - the editor to modify
 * @param onShowHelpModalRef - a ref to a callback to call to show the help modal.
 */
export default function addEditorTooltips(
  editor: Ace.Editor,
  onShowHelpModalRef: RefObject<() => void>
) {
  const tooltip = new HoverTooltip();
  const node = document.createElement('div');
  const root = createRoot(node);
  const maxMatchTextLength =
    Math.max(...Object.keys(apiHelpComponents)
      .filter((s) => s.startsWith(API_PREFIX))
      .map((s) => s.length - API_PREFIX.length)
    ) + 1; // Check just past longest match in case the very next character
  tooltip.setDataProvider((event: any, _editor: Ace.Editor) => {
    const pos: Ace.Position = event.getDocumentPosition();
    const range = editor.session.getWordRange(pos.row, pos.column);
    const result = API_PREFIX + readApiCall(editor.session, range.end, maxMatchTextLength);
    if (result in apiHelpComponents) {
      root.render(apiHelpComponents[result](() => onShowHelpModalRef.current?.()));
      tooltip.showForRange(editor, range, node, event);
    }
  });
  tooltip.addToEditor(editor);
}

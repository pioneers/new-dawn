import { Ace, require as acequire } from 'ace-builds';
import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import ApiLink from './ApiLink';
import HighlightedCode from './HighlightedCode';
import readApiCall from './readApiCall';

const { HoverTooltip } = acequire('ace/tooltip');

const apiHelpComponents: {
  [matchText: string]: () => ReactNode;
} = {
  'Robot.get_value': () => (
    <div>
      The <code>get_value</code> function returns the current value of a
      specified <code>param</code> on a device with the specified{' '}
      <code>device_id</code>.
      <br />
      Parameters:
      <ul className="parameter-list">
        <li>
          <code className="parameter-name">device_id</code>: the ID that
          specifies which PiE device will be read
        </li>
        <li>
          <code className="parameter-name">param</code>: identifies which
          parameter on the specified PiE device will be read. Possible param
          values depend on the specified device. Find a list of params for each
          type of device on the{' '}
          <ApiLink dest="lowcar-devices">lowcar devices</ApiLink> page.
        </li>
      </ul>
      The function is useful for checking the current state of devices. For
      example, getting the current state of a limit switch using its{' '}
      <code>device_id</code> and the <code>param</code> &quot;switch0&quot; will
      return True when pressed down and False if not.
      <HighlightedCode>{`
        # First segment of code ran in the teleop process
        limit_switch = "//INSERT SWITCH ID HERE//"

        def teleop_setup():
          print("Tele-operated mode has started!")

        def teleop_main():
          # Example code for getting the value of a limit switch
          #   First parameter is the limit switch's id
          #   Second parameter tells which switch to get the value from
          # In this case the method will return True or False depending on if the switch is pressed down or not

          Robot.get_value(limit_switch, switch0)
      `}</HighlightedCode>
    </div>
  ),
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

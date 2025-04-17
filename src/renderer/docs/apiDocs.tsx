import { ReactNode } from 'react';
import ApiLink from './ApiLink';
import HighlightedCode from './HighlightedCode';

const apiDocsComponents: {
  [matchText: string]: () => ReactNode;
} = {
  'api/Robot.get_value': () => (
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
          <ApiLink dest="misc/lowcar-devices">lowcar devices</ApiLink> page.
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
  'api/Robot': () => <div>Documentation for Robot object.</div>,
};

export default apiDocsComponents;

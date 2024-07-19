import AppConsoleMessage from '../common/AppConsoleMessage';
import './AppConsole.css';

/**
 * Component displaying output and error messages from student code ran on the robot.
 * @param props - props
 * @param props.messages - array of console messages to display
 */
export default function AppConsole({
  // eslint-disable-next-line
  messages,
}: {
  messages: AppConsoleMessage[];
}) {
  return (
    <div className="AppConsole">
      <div className="AppConsole-inner">Test</div>
    </div>
  );
}

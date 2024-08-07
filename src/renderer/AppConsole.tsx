import AppConsoleMessage from '../common/AppConsoleMessage';
import './AppConsole.css';

/**
 * Component displaying output and error messages from student code ran on the robot.
 * @param props - props
 * @param props.height - the height of the console in pixels
 * @param props.messages - array of console messages to display
 */
export default function AppConsole({
  height,
  messages,
}: {
  height: number;
  messages: AppConsoleMessage[];
}) {
  return (
    <div className="AppConsole" style={{ height }}>
      <pre className="AppConsole-inner">
        {messages.map((msg: AppConsoleMessage) => (
          <div
            key={msg.uuid}
            className={`AppConsole-message AppConsole-message-${msg.type}`}
          >
            {msg.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

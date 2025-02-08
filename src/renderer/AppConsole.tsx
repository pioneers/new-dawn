import { useRef, useEffect, useCallback } from 'react';
import AppConsoleMessage from '../common/AppConsoleMessage';
import './AppConsole.css';

/**
 * Component displaying output and error messages from student code ran on the robot.
 * @param props - props
 * @param props.height - the height of the console in pixels
 * @param props.messages - array of console messages to display
 * @param props.isDarkMode - whether UI is in dark mode
 */
export default function AppConsole({
  height,
  messages,
  isDarkMode,
}: {
  height: number;
  messages: AppConsoleMessage[];
  isDarkMode: boolean;
}) {
  // Add autoscroll feature to AppConsole by setting the current scrollTop prop to the current scrollHeight value
  const consoleRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="AppConsole" style={{ height }}>
      <pre
        ref={consoleRef}
        className={`AppConsole-inner-${isDarkMode ? 'dark' : 'light'}`}
      >
        {messages.map((msg: AppConsoleMessage) => (
          <div
            key={msg.uuid}
            className={`AppConsole-message-${
              isDarkMode ? 'dark' : 'light'
            } AppConsole-message-${msg.type}-${isDarkMode ? 'dark' : 'light'}`}
          >
            {msg.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

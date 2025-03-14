import { useRef, useEffect, useState } from 'react';
import AppConsoleMessage from '../common/AppConsoleMessage';
import './AppConsole.css';

/**
 * Component displaying output and error messages from student code ran on the robot.
 * @param props - props
 * @param props.height - the height of the console in pixels
 * @param props.messages - array of console messages to display
 * @param props.isDarkMode - whether UI is in dark mode
 * @param props.autoscroll - whether auto-scrolling is enabled
 */
export default function AppConsole({
  height,
  messages,
  isDarkMode,
}: {
  height: number;
  messages: AppConsoleMessage[];
  isDarkMode: boolean;
  autoscroll: boolean,
}) {
  // Add autoscroll feature to AppConsole by setting the current scrollTop prop to the current scrollHeight value
  const consoleRef = useRef<HTMLPreElement>(null);
  const [scrolledUp, setScrolledUp] = useState(false);

  const handleScroll = () => {
    if (!consoleRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

    if (isAtBottom) {
      setScrolledUp(false);
    } else {
      setScrolledUp(true);
    }
  };

  useEffect(() => {
    const shouldAutoScroll = autoscroll && !scrolledUp;

    if (shouldAutoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages, autoscroll, scrolledUp]);

  return (
    <div
      className={`AppConsole-${isDarkMode ? 'dark' : 'light'}`}
      style={{ height }}
    >
      <pre
        ref={consoleRef}
        className={`AppConsole-inner-${isDarkMode ? 'dark' : 'light'}`}
        onScroll={handleScroll}

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

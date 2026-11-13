import React, { useRef, useEffect, useState } from 'react';
import AppConsoleMessage from '../common/AppConsoleMessage';
import './AppConsole.css';

const STORAGE_KEY = 'consoleFontSize';
const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 28;
const ZOOM_STEP = 2;

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
  autoscroll,
}: {
  height: number;
  messages: AppConsoleMessage[];
  isDarkMode: boolean;
  autoscroll: boolean;
}) {
  // Add autoscroll feature to AppConsole by setting the current scrollTop prop to the current scrollHeight value
  const consoleRef = useRef<HTMLPreElement>(null);
  const [scrolledUp, setScrolledUp] = useState(false);

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : DEFAULT_FONT_SIZE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, fontSize.toString());
  }, [fontSize]);

  const handleZoomIn = () => {
    setFontSize((prev) => Math.min(prev + ZOOM_STEP, MAX_FONT_SIZE));
  };

  const handleZoomOut = () => {
    setFontSize((prev) => Math.max(prev - ZOOM_STEP, MIN_FONT_SIZE));
  };

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
  }, [messages, autoscroll, scrolledUp, fontSize]);

  return (
    <div
      className={`AppConsole-${isDarkMode ? 'dark' : 'light'}`}
      style={{ height, position: 'relative' }}
    >
      <div
        className={`AppConsole-zoom-controls AppConsole-zoom-controls-${
          isDarkMode ? 'dark' : 'light'
        }`}
      >
        <button
          type="button"
          className={`AppConsole-zoom-btn-${isDarkMode ? 'dark' : 'light'}`}
          onClick={handleZoomOut}
          disabled={fontSize <= MIN_FONT_SIZE}
          title="Zoom Out"
        >
          −
        </button>
        <button
          type="button"
          className={`AppConsole-zoom-btn-${isDarkMode ? 'dark' : 'light'}`}
          onClick={handleZoomIn}
          disabled={fontSize >= MAX_FONT_SIZE}
          title="Zoom In"
        >
          +
        </button>
      </div>
      <pre
        ref={consoleRef}
        className={`AppConsole-inner-${isDarkMode ? 'dark' : 'light'}`}
        style={{ fontSize: `${fontSize}px` }}
        onScroll={handleScroll}
      >
        {messages.map((msg: AppConsoleMessage) => (
          <div
            key={msg.uuid}
            className={`AppConsole-message-${
              isDarkMode ? 'dark' : 'light'
            } AppConsole-message-${msg.type}-${isDarkMode ? 'dark' : 'light'}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.3 }}
          >
            {msg.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

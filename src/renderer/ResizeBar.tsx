import React, { useState } from 'react';
import './ResizeBar.css';

/**
 * Component allowing Editor to be resized.
 * @param props - props
 * @param props.onStartResize - handler called when the user initiates a resize
 * @param props.onEndResize - handler called when the user ends a resize
 * @param props.axis - the axis the bar moves along
 */
export default function ResizeBar({
  onStartResize = () => {},
  onUpdateResize,
  onEndResize = () => {},
  axis,
}: {
  onStartResize: () => void;
  /**
   * handler called when the bar is dragged
   * @param pos - the signed number of pixels the bar has been moved since the start of the resize
   */
  onUpdateResize: (pos: number) => boolean;
  onEndResize: () => void;
  axis: 'x' | 'y';
}) {
  const [isResizing, setIsResizing] = useState(false);
  const [initialSize, setInitialSize] = useState(0);
  const selectCoordinate = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    return axis === 'x' ? e.clientX : e.clientY;
  };
  const startResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsResizing(true);
    setInitialSize(selectCoordinate(e));
    onStartResize();
  };
  const updateResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!onUpdateResize(selectCoordinate(e) - initialSize)) {
      setIsResizing(false);
    }
  };
  const endResize = () => {
    setIsResizing(false);
    onEndResize();
  };
  return (
    <div
      className={`ResizeBar ResizeBar-axis-${axis}`}
      onMouseDown={startResize}
      role="presentation" // Not sure how else to write this so jsx-a11y is happy
    >
      <div
        className="ResizeBar-active-area"
        onMouseUp={endResize}
        onMouseLeave={endResize}
        onMouseMove={updateResize}
        role="presentation"
        style={{ display: isResizing ? 'block' : 'none' }}
      />
    </div>
  );
}

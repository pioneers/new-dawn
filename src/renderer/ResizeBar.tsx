import { MouseEvent, useState } from 'react';
import './ResizeBar.css';

/**
 * Component allowing Editor to be resized.
 * @param props
 * @param props.onStartResize - handler called when the user initiates a resize
 * @param props.onEndResize - handler called when the user ends a resize
 * @param props.axis - the axis the bar moves along
 */
export default function ResizeBar({
  onStartResize = (): void => {},
  onUpdateResize,
  onEndResize = (): void => {},
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
}): JSX.Element {
  const [isResizing, setIsResizing] = useState(false);
  const [initialSize, setInitialSize] = useState(0);
  const selectCoordinate = (e: MouseEvent<HTMLDivElement>): number => {
    return axis === 'x' ? e.clientX : e.clientY;
  };
  const startResize = (e: MouseEvent<HTMLDivElement>): void => {
    setIsResizing(true);
    setInitialSize(selectCoordinate(e));
    onStartResize();
  };
  const updateResize = (e: MouseEvent<HTMLDivElement>): void => {
    if (!onUpdateResize(selectCoordinate(e) - initialSize)) {
      setIsResizing(false);
    }
  };
  const endResize = (): void => {
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

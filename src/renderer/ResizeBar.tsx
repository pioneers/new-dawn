import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { editorActions } from './store/editorSlice';
import { State } from './store/store';
import './ResizeBar.css'

/**
 * Component allowing Editor to be resized.
 */
export default function ResizeBar() {
  const isResizing = useSelector((state: State) => state.editor.layoutInfo.resizeInitialXPos) !== -1;
  const dispatch = useDispatch();
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    dispatch(editorActions.beginResizeAtPos(e.clientX));
  const handleMouseUp = () => dispatch(editorActions.endResize());
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    dispatch(editorActions.resizeToPos(e.clientX));
  return (
    <div className="ResizeBar" onMouseDown={handleMouseDown}>
      <div className="ResizeBar-active-area" onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove} style={{ display: isResizing ? "block" : "none" }}>
      </div>
    </div>
  );
}

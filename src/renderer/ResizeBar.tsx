import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { editorActions } from './store/editorSlice';
import { State } from './store/store';
import './ResizeBar.css'

/**
 * Component allowing Editor to be resized.
 */
export default function ResizeBar() {
  const isResizing = useSelector((state: State) =>
    (state.editor.layoutInfo.resizeInitialXPos !== -1));
  const dispatch = useDispatch();
  const startResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    dispatch(editorActions.beginResizeAtPos(e.clientX));
  const updateResize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    dispatch(editorActions.resizeToPos(e.clientX));
  const endResize = () => dispatch(editorActions.endResize());
  return (
    <div className="ResizeBar" onMouseDown={startResize}>
      <div className="ResizeBar-active-area" onMouseUp={endResize} onMouseLeave={endResize}
        onMouseMove={updateResize} style={{ display: isResizing ? "block" : "none" }}>
      </div>
    </div>
  );
}

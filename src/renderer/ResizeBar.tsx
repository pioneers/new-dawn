import { useSelector, useDispatch } from 'react-redux';
import { editorActions } from './store/editorSlice.tsx';
import './ResizeBar.css'

/**
 * Component allowing Editor to be resized.
 */
export default function ResizeBar() {
  const isResizing = useSelector(state => state.editor.layoutInfo.resizeInitialXPos) !== -1;
  const dispatch = useDispatch();
  const handleMouseDown = e => dispatch(editorActions.beginResizeAtPos(e.clientX));
  const handleMouseUp = () => dispatch(editorActions.endResize());
  const handleMouseMove = e => dispatch(editorActions.resizeToPos(e.clientX));
  return (
    <div className="ResizeBar" onMouseDown={handleMouseDown}>
      <div className="ResizeBar-active-area" onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove} style={{ display: isResizing ? "block" : "none" }}>
      </div>
    </div>
  );
}

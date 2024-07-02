import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-python';
import { useSelector, useDispatch } from 'react-redux';
import { editorActions } from 'renderer/store/editorSlice.tsx';

/**
 * Component holding the Ace editor and editor toolbar.
 */
export default function Editor() { 
  const dispatch = useDispatch();
  // useEffect with dispatch as the only dependency runs once, as if by componentDidMount
  useEffect(() => {
    dispatch(editorActions.initLayout({
      width: window.innerWidth * 0.6, // initial width is 60% of window size
      // Editor should scale with window (really should scale with parent element, but I'm not sure
      // how to do that):
      containerWidth: window.innerWidth,
      minWidthPercent: 0.50, // percentages of containerWidth
      maxWidthPercent: 0.85
    }));
    window.addEventListener('resize',
      () => dispatch(editorActions.resizeContainer(window.innerWidth)));
  }, [dispatch]);
      
  const width = useSelector(state => state.editor.layoutInfo.width);
  return (
    <div className='Editor' style={{ width: width, flexGrow: 0 }}>
      <AceEditor
        style={{ width: '100%' }}
        mode="python"
        onChange={(e)=>dispatch(editorActions.setContent(e))}
      />
    </div>
  );
}

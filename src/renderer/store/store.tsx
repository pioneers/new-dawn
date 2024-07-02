import { configureStore } from '@reduxjs/toolkit';
import robotInfoReducer, { RobotInfoState } from './robotInfoSlice';
import editorReducer, { EditorState } from './editorSlice';

export interface State {
  robotInfo: RobotInfoState,
  editor: EditorState
}
export default configureStore({
  reducer: {
    robotInfo: robotInfoReducer,
    editor: editorReducer
  }
});

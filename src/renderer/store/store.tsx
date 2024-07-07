import { configureStore } from '@reduxjs/toolkit';
import robotInfoReducer, { RobotInfoState } from './robotInfoSlice';
import editorReducer, { EditorState } from './editorSlice';
import modalReducer, { ModalState } from './modalSlice';

export interface State {
  robotInfo: RobotInfoState,
  editor: EditorState,
  modal: ModalState
}
export default configureStore({
  reducer: {
    robotInfo: robotInfoReducer,
    editor: editorReducer,
    modal: modalReducer
  }
});

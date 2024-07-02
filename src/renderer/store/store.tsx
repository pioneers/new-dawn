import { configureStore } from '@reduxjs/toolkit';
import robotInfoReducer from './robotInfoSlice.tsx';
import editorReducer from './editorSlice.tsx';

export default configureStore({
  reducer: {
    robotInfo: robotInfoReducer,
    editor: editorReducer
  }
});

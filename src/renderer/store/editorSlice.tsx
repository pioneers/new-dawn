import { createSlice } from '@reduxjs/toolkit';

export const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    content: "",
    layoutInfo: {
      resizeInitialXPos: -1,
      width: -1,
      widthBeforeResize: -1,
      containerWidth: -1
    },
  },
  reducers: {
    /**
     * Sets the stored content of the editor.
     */
    setContent: (state, { payload }) => {
      state.content = payload;
    },
    /**
     * Initiates a resize of the editor with the given initial drag x-position.
     */
    beginResizeAtPos: (state, { payload }) => {
      if (state.layoutInfo.width !== -1) {
        state.layoutInfo.resizeInitialXPos = payload;
        state.layoutInfo.widthBeforeResize = state.layoutInfo.width;
      }
    },
    /**
     * Calculates the new size of the editor given the current drag x-position.
     */
    resizeToPos: (state, { payload }) => {
      if (state.layoutInfo.width !== -1) {
        const li = state.layoutInfo;
        state.layoutInfo.width = Math.min(
          Math.max(
            state.layoutInfo.widthBeforeResize + payload - state.layoutInfo.resizeInitialXPos,
            state.layoutInfo.containerWidth * state.layoutInfo.minWidthPercent
          ),
          state.layoutInfo.containerWidth * state.layoutInfo.maxWidthPercent
        );
      }
    },
    /**
     * Ends a resize of the editor.
     */
    endResize: (state) => {
      state.layoutInfo.resizeInitialXPos = -1;
    },
    /**
     * Initializes state related to editor layout.
     */
    initLayout: (state, { payload: { width, containerWidth, maxWidthPercent, minWidthPercent }}) => {
      if (state.layoutInfo.width === -1) {
        state.layoutInfo.width = width;
        state.layoutInfo.containerWidth = containerWidth;
        state.layoutInfo.maxWidthPercent = maxWidthPercent;
        state.layoutInfo.minWidthPercent = minWidthPercent;
      }
    },
    /**
     * Resizes the editor to maintain the proportion between its width and the container width.
     */
    resizeContainer: (state, { payload }) => {
      if (state.layoutInfo.width !== -1) {
        state.layoutInfo.width *= payload / state.layoutInfo.containerWidth;
        state.layoutInfo.containerWidth = payload;
        state.layoutInfo.resizeInitialXPos = -1;
      }
    }
  }
});

export const editorActions = editorSlice.actions;
export default editorSlice.reducer;

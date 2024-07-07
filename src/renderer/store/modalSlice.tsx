import { createSlice } from '@reduxjs/toolkit';

export enum Modals {
  None,
  ConnectionConfig,
  GamepadInfo
}
const initialState = {
  activeModal: Modals.None
};
export const modalSlice = createSlice({
  name: 'modal',
  initialState: initialState,
  reducers: {
    /**
     * Sets the currently active modal.
     */
    setActive: (state, { payload }) => {
      console.log('set active to ' + payload.toString());
      state.activeModal = payload;
    }
  }
});

export const modalActions = modalSlice.actions;
export type ModalState = typeof initialState;
export default modalSlice.reducer;

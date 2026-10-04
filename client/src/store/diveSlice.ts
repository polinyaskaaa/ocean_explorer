import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MAX_DEPTH } from '../lib/ocean';

interface DiveState {
  depth: number;
  started: boolean;
  maxReached: number;
  above: boolean;
}

const initialState: DiveState = {
  depth: 0,
  started: false,
  maxReached: 0,
  above: true,
};

const diveSlice = createSlice({
  name: 'dive',
  initialState,
  reducers: {
    setDepth(state, action: PayloadAction<number>) {
      const depth = Math.min(MAX_DEPTH, Math.max(0, action.payload));
      state.depth = depth;
      if (depth > state.maxReached) state.maxReached = depth;
      if (depth > 5) state.started = true;
    },
    setAbove(state, action: PayloadAction<boolean>) {
      state.above = action.payload;
    },
    resetDive(state) {
      state.depth = 0;
      state.started = false;
      state.above = true;
    },
  },
});

export const { setDepth, setAbove, resetDive } = diveSlice.actions;
export default diveSlice.reducer;

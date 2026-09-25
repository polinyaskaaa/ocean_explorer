import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApiError } from '../api/client';
import { creaturesApi } from '../api/endpoints';
import type { Creature } from '../types';

interface CreaturesState {
  items: Creature[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedId: string | null;
}

const initialState: CreaturesState = {
  items: [],
  status: 'idle',
  error: null,
  selectedId: null,
};

export const fetchCreatures = createAsyncThunk<Creature[], void, { rejectValue: string }>(
  'creatures/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { creatures } = await creaturesApi.list();
      return creatures;
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : 'Не вдалося завантажити мешканців');
    }
  },
);

const creaturesSlice = createSlice({
  name: 'creatures',
  initialState,
  reducers: {
    selectCreature(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    closeCreature(state) {
      state.selectedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreatures.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCreatures.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCreatures.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Не вдалося завантажити мешканців';
      });
  },
});

export const { selectCreature, closeCreature } = creaturesSlice.actions;
export default creaturesSlice.reducer;

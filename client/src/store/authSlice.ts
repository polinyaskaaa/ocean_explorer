import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApiError, TOKEN_STORAGE_KEY } from '../api/client';
import { authApi, progressApi } from '../api/endpoints';
import type { AuthResponse, User } from '../types';

const USER_STORAGE_KEY = 'doe.user';
const PROGRESS_STORAGE_KEY = 'doe.progress';

function persist(token: string | null, user: User | null, completed: string[]) {
  try {
    if (token && user) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completed));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    }
  } catch {
  }
}

function readCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  user: User | null;
  completedCreatureIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  initializing: boolean;
  error: string | null;
}

const cachedToken = readToken();

const initialState: AuthState = {
  token: cachedToken,
  user: cachedToken ? readCache<User | null>(USER_STORAGE_KEY, null) : null,
  completedCreatureIds: cachedToken ? readCache<string[]>(PROGRESS_STORAGE_KEY, []) : [],
  status: 'idle',
  initializing: Boolean(cachedToken),
  error: null,
};

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Несподівана помилка';
}

export const login = createAsyncThunk<AuthResponse, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials);
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  },
);

export const register = createAsyncThunk<
  AuthResponse,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

export const restoreSession = createAsyncThunk<
  { user: User; completedCreatureIds: string[] } | null,
  void,
  { rejectValue: string }
>('auth/restore', async (_, { rejectWithValue }) => {
  if (!readToken()) return null;

  try {
    const progress = await progressApi.get();
    return { user: progress.user, completedCreatureIds: progress.completedCreatureIds };
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.completedCreatureIds = [];
      state.status = 'idle';
      state.error = null;
      persist(null, null, []);
    },
    clearError(state) {
      state.error = null;
    },
    applyQuizReward(state, action: PayloadAction<{ creatureId: string; totalScore: number; awarded: boolean }>) {
      if (!state.user) return;
      state.user.score = action.payload.totalScore;
      if (action.payload.awarded && !state.completedCreatureIds.includes(action.payload.creatureId)) {
        state.completedCreatureIds.push(action.payload.creatureId);
      }
      persist(state.token, state.user, state.completedCreatureIds);
    },
  },
  extraReducers: (builder) => {
    const onAuthSuccess = (state: AuthState, action: PayloadAction<AuthResponse>) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.completedCreatureIds = [];
      state.error = null;
      persist(state.token, state.user, state.completedCreatureIds);
    };

    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, onAuthSuccess)
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Не вдалося увійти';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, onAuthSuccess)
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Не вдалося зареєструватися';
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initializing = false;
        if (!action.payload) return;
        state.user = action.payload.user;
        state.completedCreatureIds = action.payload.completedCreatureIds;
        persist(state.token, state.user, state.completedCreatureIds);
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initializing = false;
        state.token = null;
        state.user = null;
        state.completedCreatureIds = [];
        persist(null, null, []);
      });
  },
});

export const { logout, clearError, applyQuizReward } = authSlice.actions;
export default authSlice.reducer;

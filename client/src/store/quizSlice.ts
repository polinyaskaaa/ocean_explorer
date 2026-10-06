import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ApiError } from '../api/client';
import { quizApi } from '../api/endpoints';
import type { QuizResult, QuizSession } from '../types';
import { applyQuizReward } from './authSlice';

interface QuizState {
  session: QuizSession | null;
  answers: Record<string, number>;
  result: QuizResult | null;
  status: 'idle' | 'loading' | 'active' | 'submitting' | 'finished' | 'failed';
  error: string | null;
}

const initialState: QuizState = {
  session: null,
  answers: {},
  result: null,
  status: 'idle',
  error: null,
};

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Несподівана помилка';
}

export const startQuiz = createAsyncThunk<QuizSession, string, { rejectValue: string }>(
  'quiz/start',
  async (creatureId, { rejectWithValue }) => {
    try {
      return await quizApi.start(creatureId);
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  },
);

export const submitQuiz = createAsyncThunk<QuizResult, void, { state: { quiz: QuizState }; rejectValue: string }>(
  'quiz/submit',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { session, answers } = getState().quiz;
    if (!session) return rejectWithValue('Квіз не розпочато');

    try {
      const result = await quizApi.submit(
        session.creatureId,
        session.questions.map((q) => ({ questionId: q.id, optionIndex: answers[q.id] })),
      );

      dispatch(
        applyQuizReward({
          creatureId: session.creatureId,
          totalScore: result.totalScore,
          awarded: result.awardedPoint,
        }),
      );

      return result;
    } catch (err) {
      return rejectWithValue(errorMessage(err));
    }
  },
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    answerQuestion(state, action: PayloadAction<{ questionId: string; optionIndex: number }>) {
      state.answers[action.payload.questionId] = action.payload.optionIndex;
    },
    resetQuiz() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startQuiz.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.result = null;
        state.answers = {};
      })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.status = 'active';
        state.session = action.payload;
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Не вдалося розпочати квіз';
      })
      .addCase(submitQuiz.pending, (state) => {
        state.status = 'submitting';
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.status = 'finished';
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.status = 'active';
        state.error = action.payload ?? 'Не вдалося надіслати відповіді';
      });
  },
});

export const { answerQuestion, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;

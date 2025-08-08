import { configureStore } from '@reduxjs/toolkit'

// Import slices
import activeAction from './active'

export const store = configureStore({
  reducer: {
    activeAction
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
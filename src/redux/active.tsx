import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type activeAction = {
    newSet: boolean,
    newWord: boolean
}

const initialState: activeAction = {
    newSet: false,
    newWord: false
}

export const activeAction = createSlice({
    name: 'activeAction',
    initialState,
    reducers: {
        changeStatus_newSet: (state) => {
            const toggleState = !state.newSet
            state.newSet = toggleState
        },
        changeStatus_newWord: (state, action: PayloadAction<boolean>) => {
            const toggleState = action.payload
            state.newWord = toggleState
        }
    },
})

// Action creators are generated for each case reducer function
export const { changeStatus_newSet, changeStatus_newWord } = activeAction.actions

export default activeAction.reducer
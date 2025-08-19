import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type activeAction = {
    newSet: boolean,
    newWord: boolean,
    deleteSet: boolean
}

const initialState: activeAction = {
    newSet: false,
    newWord: false,
    deleteSet: false
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
        },
        changeStatus_deleteSet: (state, action: PayloadAction<boolean>) => {
            const toggleState = action.payload
            state.deleteSet = toggleState
        },
    },
})

// Action creators are generated for each case reducer function
export const { changeStatus_newSet, changeStatus_newWord, changeStatus_deleteSet } = activeAction.actions

export default activeAction.reducer
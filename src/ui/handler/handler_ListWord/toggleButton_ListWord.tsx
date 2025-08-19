// Import libraries
import React from "react"
import { toast } from "react-toastify"

// Import type
import { Word } from "../../types/DataStructure"

type values = {
    state_newWord: boolean,
    isDeleteWord: boolean,
    listWordDelete: boolean[],
    isAddNewWord: boolean,
    listenMode: boolean,
    words: Word[]
}

type stateSetter = {
    setListWordDelete: React.Dispatch<React.SetStateAction<Array<boolean>>>,
    setIsDeleteWord: React.Dispatch<React.SetStateAction<boolean>>,
    setIsAddNewWord: React.Dispatch<React.SetStateAction<boolean>>,
    setListenMode: React.Dispatch<React.SetStateAction<boolean>>
}

export function toggleButton_ListWord(values: values, stateSetter: stateSetter) {
    const {
        state_newWord,
        isDeleteWord,
        listWordDelete,
        isAddNewWord,
        listenMode,
        words
    } = values
    const {
        setListWordDelete,
        setIsDeleteWord,
        setIsAddNewWord,
        setListenMode
    } = stateSetter

    // Toggle choose all 
    const toggleChooseAll = React.useCallback((checked: boolean) => {
        setListWordDelete(words.map(() => checked))
    }, [words])

    // Toggle delete word
    const toggleDeleteWord = React.useCallback(() => {
        if (!state_newWord) {
            const newList = listWordDelete.map(() => false)
            setListWordDelete([...newList])
            setIsDeleteWord(!isDeleteWord)
        } else {
            toast.info('Your word is being progressed', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }
    }, [isDeleteWord, state_newWord])

    // Choose delete word
    const chooseDeleteWord = (index: number) => {
        const toggleValue = !listWordDelete[index]

        if (typeof toggleValue === "boolean") {
            const listWordDelete_copy = [...listWordDelete]
            listWordDelete_copy[index] = toggleValue
            setListWordDelete([...listWordDelete_copy])
        }
    }

    const chooseTagDeleteWord = (index: number) => {
        chooseDeleteWord(index)
    }

    // Toggle Add A new word
    const toggleAddNewWord = React.useCallback(() => {
        if (!state_newWord) {
            setIsAddNewWord(!isAddNewWord)
        } else {
            toast.info('Your word is being progressed', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }
    }, [isAddNewWord, state_newWord])

    // Toggle Listen mode
    const toggleListen = React.useCallback(() => {
        if (words.length === 0) {
            toast.info("Let's add the first word", {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        } else {
            setListenMode(!listenMode)
        }
    }, [listenMode, words.length])


    return {
        toggleChooseAll,
        toggleDeleteWord,
        chooseDeleteWord,
        chooseTagDeleteWord,
        toggleAddNewWord,
        toggleListen
    }
}
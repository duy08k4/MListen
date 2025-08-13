// Import libraries
import React from "react"
import { toast } from "react-toastify"
import { v4 } from "uuid"
import { useDispatch } from "react-redux"

// Import type
import { Word } from "../../types/DataStructure"

// Import redux
import { changeStatus_deleteSet, changeStatus_newWord } from "../../redux/active"

// Import tauri method
import { addANewWord, deleteWord, getSound, playSound, removeSet } from "../../tauri_method/tauri_method"

type values = {
    debounce_keySearch: React.ReactNode,
    words: Word[],
    newWord: Word,
    idSet: string,
    listWordDelete: Array<boolean>,
    listenMode: boolean,
    isDeleteWord: boolean,
    isAddNewWord: boolean
}

type stateSetter = {
    setWordsSearch: React.Dispatch<React.SetStateAction<Word[]>>
    setNewWord: React.Dispatch<React.SetStateAction<Word>>,
    setRecentWord: React.Dispatch<React.SetStateAction<Word | null>>
}

type func = {
    toggleAddNewWord: () => void,
    toggleDeleteWord: () => void
}

export function handler_ListWord(values: values, stateSetter: stateSetter, func: func) {
    const dispatch = useDispatch()

    const {
        debounce_keySearch,
        words,
        newWord,
        idSet,
        listWordDelete,
        listenMode,
        isDeleteWord,
        isAddNewWord
    } = values

    const {
        setWordsSearch,
        setNewWord,
        setRecentWord
    } = stateSetter

    const {
        toggleAddNewWord,
        toggleDeleteWord
    } = func

    // Search word
    const searchWord = React.useCallback(() => {
        if (debounce_keySearch) {
            const searchResult = words.filter(word => word.word.toLowerCase().includes((debounce_keySearch as string).toLocaleLowerCase()))

            if (searchResult.length === 0) {
                toast.warn(`Word not found`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
                setWordsSearch([])
            } else {
                toast.success(`Found ${searchResult.length} word${searchResult.length > 1 ? 's' : ''}`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
                setWordsSearch(searchResult)
            }
        } else {
            setWordsSearch([])
        }
    }, [debounce_keySearch])

    // Add new word
    const handleInputNewWord = (key: keyof Word, value: string) => {
        if (key) {
            setNewWord(prev => ({
                ...prev,
                [key]: value as Word[typeof key]
            }));
        }
    }

    const handleAddANewWord = React.useCallback(async () => {
        const additionalNewWord: Word = { ...newWord, id: v4() }
        const cleanedWord: Word = Object.fromEntries(
            Object.entries(additionalNewWord).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
        ) as Word;

        const listValue = Object.values(cleanedWord).map(value => value.trim().length > 0 ? true : false)
        const checkNewWord = listValue.includes(false)

        if (checkNewWord) {
            toast.warn('Please fill all fields', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        } else {
            toggleAddNewWord()

            const proccessToast = toast.loading(`Adding word...`, {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: false,
                theme: "light",
            });

            dispatch(changeStatus_newWord(true))

            await addANewWord(idSet, cleanedWord).then(() => {
                toast.dismiss(proccessToast)
                toast.success(`Added your word`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
            }).catch(() => {
                toast.dismiss(proccessToast)
                toast.error(`Failed to add your word`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
            }).finally(() => {
                dispatch(changeStatus_newWord(false))
                setNewWord({
                    word: "",
                    transcription: "",
                    id: "",
                    partOfSpeech: "",
                    meaning: ""
                })
            })
        }
    }, [newWord])

    // Delete word
    const handleDeleteWord = React.useCallback(async () => {
        const listDelete = listWordDelete.map((value, index) => value ? words[index].id : null).filter(value => value) as string[]

        if (listDelete.length === 0) {
            toast.warn('Please choose at least one word', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
            return
        }

        toggleDeleteWord()

        const proccessToast = toast.loading(`Deleting...`, {
            position: "bottom-right",
            autoClose: false,
            closeOnClick: false,
            theme: "light",
        });

        dispatch(changeStatus_newWord(true))

        await deleteWord(idSet, listDelete).then(() => {
            toast.dismiss(proccessToast)
            toast.success('Deleted', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }).catch(() => {
            toast.dismiss(proccessToast)
            toast.error(`Can't delete`, {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }).finally(() => {
            dispatch(changeStatus_newWord(false))
        })
    }, [listWordDelete])

    // Delete set
    const handleDeleteSet = async () => {
        let setId = [idSet]

        if (setId.length === 0 && !setId[0]) return

        const proccessToast = toast.loading(`Deleting...`, {
            position: "bottom-right",
            autoClose: false,
            closeOnClick: false,
            theme: "light",
        });

        dispatch(changeStatus_deleteSet(true))

        await removeSet(setId).then(() => {
            toast.dismiss(proccessToast)
            toast.success('Deleted', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }).catch((err) => {
            console.error(err)
            toast.dismiss(proccessToast)
            toast.error(`Can't delete`, {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }).finally(() => {
            dispatch(changeStatus_deleteSet(false))
        })
    }

    // Get sound
    const handleSound = async (word: Word) => {
        if (listenMode) {
            setRecentWord(word)
            const proccessToast = toast.loading(`Loading audio...`, {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: false,
                theme: "light",
            });

            await getSound(word).then(async (soundId) => {
                toast.dismiss(proccessToast)
                await playSound(soundId)
            }).catch(() => {
                toast.error(`No audio found.`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
            })
        } else {
            if (!isDeleteWord && !isAddNewWord) {
                toast.info(`💡 Please turn on Listen Mode first.`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                })
            }
        }
    }


    return {
        searchWord,
        handleInputNewWord,
        handleAddANewWord,
        handleDeleteWord,
        handleDeleteSet,
        handleSound
    }
}
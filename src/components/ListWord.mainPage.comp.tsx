// Libraries
import React, { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { v4 } from "uuid"

// Import type
import { Word, SetStructure } from "../types/DataStructure"

// Import component
import Listen from "./Listen.mainPage.comp"

// Import custom hook
import { useDebounce } from "../customHooks/debounce"

// Import method system file
import { addANewWord, changeSetName, deleteWord, getSound, readFile } from "../tauri_method/tauri_method"

// Import redux
import { useDispatch, useSelector } from "react-redux"
import { changeStatus_newSet, changeStatus_newWord } from "../redux/active"
import { RootState } from "../redux/store"

type ListWord = {
    objSet: SetStructure,
    statusDelete: boolean
}


const ListWord: React.FC<ListWord> = ({ objSet, statusDelete }) => {
    // State
    const [isDeleteWord, setIsDeleteWord] = useState<boolean>(false)
    const [isAddNewWord, setIsAddNewWord] = useState<boolean>(false)
    const [hideDeleteWordButton, setHideDeleteWordButton] = useState<boolean>(false)
    const [listenMode, setListenMode] = useState<boolean>(false)
    const [learnMore, setLearnMore] = useState<boolean>(false)
    const [isListen, setIsListen] = useState<boolean>(false)

    // Data
    const [nameSet, setNameSet] = useState<string>(objSet.name ?? "")
    const [idSet, setIdSet] = useState<string>("")
    const [words, setWords] = useState<Word[]>([])
    const [keySearch, setKeySearch] = useState<string>("")
    const [wordsSearch, setWordsSearch] = useState<Word[]>([])

    const [listWordDelete, setListWordDelete] = useState<Array<boolean>>(words.map(() => false))
    const [newWord, setNewWord] = useState<Word>({
        word: "",
        transcription: "",
        id: "",
        partOfSpeech: "",
        meaning: ""
    })

    const partOfSpeechList = useRef<string[]>(["noun", "verb", "adjective", "adverb"])
    const [changeHistory, setChangeHistory] = useState<Array<string>>([])

    // Redux
    const dispatch = useDispatch()
    const state_newWord = useSelector((state: RootState) => state.activeAction.newWord)

    // Debounce
    const debounce_nameSet = useDebounce(nameSet, 1000)
    const debounce_newWord = useDebounce(newWord, 500)
    const debounce_keySearch = useDebounce(keySearch, 500)

    useEffect(() => {
        setNameSet(objSet.name)
        setIdSet(objSet.id)
    }, [objSet])

    useEffect(() => {
        (async () => {
            if (idSet) {
                const listWord = await readFile<Word>(idSet)
                setWords(listWord)
            }
        })()
    }, [idSet, debounce_newWord, state_newWord])

    // Toggle
    const toggleDeleteWord = () => {
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
    }

    const toggleAddNewWord = () => {
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
    }

    const toggleListen = () => {
        setListenMode(!listenMode)
    }

    const toggleChooseAll = (checked: boolean) => {
        if (checked) {
            const newList = listWordDelete.map(() => true)
            setListWordDelete([...newList])
        } else {
            const newList = listWordDelete.map(() => false)
            setListWordDelete([...newList])
        }
    }

    // Choose delete word
    const chooseDeleteWord = (index: number) => {
        const toggleValue = !listWordDelete[index]

        if (typeof toggleValue === "boolean") {
            const listWordDelete_copy = listWordDelete
            listWordDelete_copy[index] = toggleValue
            setListWordDelete([...listWordDelete_copy])
        }
    }

    const chooseTagDeleteWord = (index: number) => {
        chooseDeleteWord(index)
    }

    // Search word
    useEffect(() => searchWord(), [debounce_keySearch])

    const searchWord = () => {
        if (debounce_keySearch) {
            const searchResult = words.filter(word => word.word.toLowerCase().includes(debounce_keySearch.toLocaleLowerCase()))

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
    }

    // Add new word
    const handleInputNewWord = (key: keyof Word, value: string) => {
        if (key) {
            setNewWord(prev => ({
                ...prev,
                [key]: value as Word[typeof key]
            }));
        }
    }

    const handleAddANewWord = async () => {
        const additionalNewWord: Word = { ...newWord, id: v4() }
        const listValue = Object.values(additionalNewWord).map(value => value.trim().length > 0 ? true : false)
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

            const proccessToast = toast.loading(`Adding ${newWord.word}`, {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: false,
                theme: "light",
            });

            dispatch(changeStatus_newWord(true))

            await addANewWord(idSet, additionalNewWord).then(() => {
                toast.dismiss(proccessToast)
                toast.success(`Added your word`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
            }).catch((err) => {
                console.error(err)
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
    }

    // Change set name
    const handleChangeSetName = async (newName: string, setId: string) => {
        await changeSetName(newName, setId)
    }

    useEffect(() => {
        (async () => {
            if (debounce_nameSet && debounce_nameSet != objSet.name) {
                await handleChangeSetName(nameSet, objSet.id).then(() => {
                    toast.success('Changed name', {
                        position: "bottom-right",
                        autoClose: 5000,
                        closeOnClick: true,
                        theme: "light",
                    });
                }).catch((err) => {
                    console.log(err)
                    toast.error(`Can't change name`, {
                        position: "bottom-right",
                        autoClose: 5000,
                        closeOnClick: true,
                        theme: "light",
                    });
                }).finally(() => {
                    dispatch(changeStatus_newSet())
                })
            }
        })()
    }, [debounce_nameSet])

    // Delete word
    const handleDeleteWord = async () => {
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
        }).catch((err) => {
            console.log(err)
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
    }

    // Get sound
    const handleSound = async (word: string) => {
        if (listenMode) {
            const proccessToast = toast.loading(`Deleting...`, {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: false,
                theme: "light",
            });

            await getSound(word).then(() => {
                toast.dismiss(proccessToast)
            }).catch((err) => {
                console.error(err)
                toast.error(`No audio found.`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
            })
        } else {
            toast.info(`💡 Please turn on Listen Mode first.`, {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }
    }


    return (
        <div className="ListWord  h-full w-full bg-[transparent] flex flex-col gap-2.5 ">
            <div className="ListWord__functionContainer w-full h-[80px] bg-white flex items-center gap-5 shadow-[0px_0px_5px_#d3d3d3] rounded-[10px] px-[20px]">
                <div className="h-full flex gap-1.5 flex-col justify-center">
                    <input
                        type="text"
                        className="text-mediumSize font-medium outline-lightGrayy bg-[#dadada] px-[10px] py-[5px] rounded-[5px]"
                        value={nameSet || ""}
                        onChange={(e) => { setNameSet(e.target.value) }}
                    />
                </div>

                <div className="flex-1 flex gap-2.5">
                    {!listenMode && (
                        <>
                            <button className="text-normalSize font-medium flex items-center gap-2.5 bg-lightGrayy py-[10px] px-[20px] rounded-[5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                                </svg>

                                Import excel
                            </button>

                            {!statusDelete && (
                                <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-red py-[10px] px-[20px] rounded-[5px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>

                                    Delete Collection
                                </button>
                            )}
                        </>
                    )}

                </div>

                <div className="flex gap-2.5">
                    <button className={`text-normalSize font-medium text-white flex items-center gap-2.5 ${listenMode ? "bg-red" : "bg-blue"} py-[10px] px-[20px] rounded-[5px]`} onClick={toggleListen}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>

                        {listenMode ? "Turn Off Listen Mode" : "Listen Mode"}
                    </button>

                    <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-orange py-[10px] px-[20px] rounded-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>

                        Dictation
                    </button>
                </div>
            </div>

            <div className="ListWord__list w-full h-[calc(100%-140px)] bg-white flex flex-col gap-2.5 shadow-[0px_0px_5px_#d3d3d3] rounded-[10px] px-[20px] pt-5">

                {listenMode && learnMore && (
                    <div className="w-full h-[450px] max-h-[450px] bg-white flex gap-10 items-center border-b border-b-lightGrayy">
                        <div className="w-[15%] h-full flex gap-2.5 flex-col items-center">
                            <div className="w-full">
                                <h1 className="text-mediumSize font-medium">Part of Speech</h1>
                            </div>

                            <div className="w-full flex-1 overflow-auto flex flex-col items-center">
                                <a href="" className="!w-full text-mediumSize bg-[#f5f5f5] rounded-[10px] px-2.5 py-3 hover:cursor-grab hover:brightness-90 active:cursor-grabbing active:brightness-[80%]">asd</a>
                            </div>

                        </div>

                        <div className="flex-1 h-full flex flex-col items-center gap-20 overflow-y-scroll">

                            <div className="w-full flex flex-col items-center gap-7">
                                <div className="w-full">
                                    <span className="w-full flex items-center gap-5">
                                        <h3 className="text-largeSize font-bold">Wind</h3>

                                        <button className="flex items-center gap-2.5 text-undermediumSize text-white font-medium bg-green px-5 py-1.5 rounded-[5px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-2 stroke-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                            </svg>

                                            Hear
                                        </button>
                                    </span>

                                    <span className="flex items-end gap-2.5">
                                        <p className="capitalize text-mediumSize text-red font-bold">noun</p>
                                        <p className="text-mediumSize font-medium text-grayy">/wind/</p>
                                    </span>

                                </div>

                                <div className="w-full flex flex-col gap-5">
                                    <div className="w-full h-fit flex items-center gap-2.5 px-2.5">
                                        <button className="flex items-center gap-2.5 text-undermediumSize text-white font-medium bg-blue px-2.5 py-1.5 rounded-[5px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-2 stroke-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                            </svg>
                                        </button>

                                        <p className="text-mediumSize"><b>Ex: </b>plaplapla</p>
                                    </div>

                                    <div className="w-full h-fit flex items-center gap-2.5 px-2.5">
                                        <button className="flex items-center gap-2.5 text-undermediumSize text-white font-medium bg-blue px-2.5 py-1.5 rounded-[5px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-2 stroke-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                            </svg>
                                        </button>

                                        <p className="text-mediumSize"><b>Ex: </b>plaplapla</p>
                                    </div>

                                </div>

                                <div className="Synonyms w-full h-fit flex flex-col items-center gap-2.5">
                                    <div className="w-full">
                                        <h1 className="text-bigSize font-medium">Synonyms</h1>
                                    </div>

                                    <ul className="h-fit w-full px-7">
                                        <li className="list-disc text-mediumSize">pla pla pla pla </li>
                                        <li className="list-disc text-mediumSize">pla pla pla pla </li>
                                        <li className="list-disc text-mediumSize">pla pla pla pla </li>
                                    </ul>
                                </div>

                                <div className="Synonyms w-full h-fit flex flex-col items-center gap-2.5">
                                    <div className="w-full">
                                        <h1 className="text-bigSize font-medium">Antonyms</h1>
                                    </div>

                                    <ul className="h-fit w-full px-7">
                                        <li className="list-disc text-mediumSize">pla pla pla pla </li>
                                        <li className="list-disc text-mediumSize">pla pla pla pla </li>
                                        <li className="list-disc text-mediumSize">pla pla pla pla </li>
                                    </ul>
                                </div>

                                <p className=""></p>
                            </div>

                        </div>

                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        {!isDeleteWord && (
                            <div className="w-[300px] h-fit flex items-center gap-2 px-2.5 py-1 rounded-[5px] border-[0.5px] border-lightGrayy">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>

                                <input type="text" className="outline-none flex-1" placeholder="Search word..." onChange={(e) => { setKeySearch(e.target.value) }} onFocus={() => { setHideDeleteWordButton(true) }} onBlur={() => { setHideDeleteWordButton(false) }} value={keySearch} />
                            </div>
                        )}

                        <p className="text-normal font-medium">{keySearch ? wordsSearch.length : words.length} words</p>
                    </div>

                    <div className="w-fit h-fit flex gap-2.5">
                        {!listenMode && (
                            !isDeleteWord ? (
                                isAddNewWord ? (
                                    <button className="text-white bg-red flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={toggleAddNewWord}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>

                                        Cancel adding
                                    </button>
                                ) : (
                                    <>
                                        <button className="text-white bg-green flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={toggleAddNewWord}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>

                                            New word
                                        </button>

                                        {!hideDeleteWordButton && (
                                            <button className="text-white bg-red flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={toggleDeleteWord}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>

                                                Delete word
                                            </button>
                                        )}
                                    </>
                                )

                            ) : (
                                <>
                                    <button className="text-white bg-red flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={handleDeleteWord}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>

                                        Delete selected
                                    </button>

                                    <button className="bg-lightGrayy flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={toggleDeleteWord}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>

                                        Cancel
                                    </button>
                                </>
                            )

                        )}

                        {listenMode && (
                            <>
                                <button className="bg-lightGrayy flex items-center gap-2.5 px-5 rounded-[5px] py-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>

                                    Restart
                                </button>

                                <button className="text-white bg-green flex items-center gap-2.5 px-5 rounded-[5px] py-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                                    </svg>

                                    Play
                                </button>

                                <button className="text-white bg-orange flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={() => { setLearnMore(!learnMore) }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                    Learn More
                                </button>
                            </>
                        )}

                    </div>
                </div>

                <table className="w-full">
                    <tbody className="">
                        {isAddNewWord && (
                            <tr className="leading-[3] bg-[#f5f5f5]">
                                <td className="text-center py-2.5"><button className="h-[50px] w-full bg-green px-2.5" onClick={handleAddANewWord}><i className="fas fa-check text-white"></i></button></td>
                                <td className="text-center py-2.5"><input type="text" className="outline-none h-[50px] w-[95%] bg-white px-2.5 border border-lightGrayy" value={newWord.word} onChange={(e) => { handleInputNewWord("word", e.target.value) }} placeholder="Word..." /></td>
                                <td className="text-center py-2.5"><input type="text" className="outline-none h-[50px] w-[95%] bg-white px-2.5 border border-lightGrayy" value={newWord.transcription} onChange={(e) => { handleInputNewWord("transcription", e.target.value) }} placeholder="Transcription..." /></td>
                                <td className="h-full text-center py-2.5">
                                    <select className="outline-none h-[50px] w-[95%] bg-white px-2.5 border border-lightGrayy" value={newWord.partOfSpeech} onChange={(e) => { handleInputNewWord("partOfSpeech", e.target.value) }}>
                                        <option value="">-- ---------- --</option>
                                        {partOfSpeechList.current.map((value, index) => {
                                            return (
                                                <option key={index} value={value}>{value}</option>
                                            )
                                        })}
                                    </select>
                                </td>
                                <td className="text-center py-2.5"><input type="text" className="outline-none h-[50px] w-[95%] bg-white px-2.5 border border-lightGrayy" value={newWord.meaning} onChange={(e) => { handleInputNewWord("meaning", e.target.value) }} placeholder="Meaning..." /></td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="w-full shrink overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#eeeeee] sticky top-0">
                            <tr className="leading-[4]">
                                {isDeleteWord && (<th><input type="checkbox" onChange={(e) => { toggleChooseAll(e.target.checked) }} /></th>)}
                                <th>Order</th>
                                <th>Word</th>
                                <th>Transcription</th>
                                <th>Part of speech</th>
                                <th>Meaning</th>
                            </tr>
                        </thead>

                        <tbody className="overflow-auto">
                            {words && !keySearch && words.map((data, index) => {
                                return (
                                    <tr key={index} className="leading-[3] border-b-[0.5px] border-b-lightGrayy hover:bg-[#f5f5f5] hover:cursor-grab" onClick={() => { chooseTagDeleteWord(index) }} onDoubleClick={() => { handleSound(data.word) }}>
                                        {isDeleteWord && (<td className="text-center"><input type="checkbox" onChange={() => { chooseDeleteWord(index) }} checked={!!listWordDelete[index]} /></td>)}
                                        <td className="select-none text-center py-2.5">{index + 1}</td>
                                        <td title={data.word} className="select-none text-center py-2.5">{data.word}</td>
                                        <td title={data.transcription} className="select-none text-center py-2.5">{data.transcription}</td>
                                        <td title={data.partOfSpeech} className="select-none text-center py-2.5">{data.partOfSpeech}</td>
                                        <td title={data.meaning} className="select-none max-w-[100px] text-center py-2.5 truncate">{data.meaning}</td>
                                    </tr>
                                )
                            })}

                            {keySearch && wordsSearch.map((data, index) => {
                                return (
                                    <tr key={index} className="leading-[3] border-b-[0.5px] border-b-lightGrayy hover:bg-[#f5f5f5] hover:cursor-grab" onClick={() => { chooseTagDeleteWord(index) }} onDoubleClick={() => { handleSound(data.word) }}>
                                        {isDeleteWord && (<td className="text-center"><input type="checkbox" onChange={() => { chooseDeleteWord(index) }} checked={!!listWordDelete[index]} /></td>)}
                                        <td className="select-none text-center py-2.5">{index + 1}</td>
                                        <td title={data.word} className="select-none text-center py-2.5">{data.word}</td>
                                        <td title={data.transcription} className="select-none text-center py-2.5">{data.transcription}</td>
                                        <td title={data.partOfSpeech} className="select-none text-center py-2.5">{data.partOfSpeech}</td>
                                        <td title={data.meaning} className="select-none text-center py-2.5 truncate">{data.meaning}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>

            <div className="h-[60px] flex justify-center items-center">
                <span className="text-normalSize flex gap-2.5">
                    <b>© 2025 dDev</b>
                    This product uses data from <b>Free Dictionary</b> licensed under 
                    <a href="https://creativecommons.org/licenses/by-sa/3.0/" className="text-blue" target="_blank" rel="noopener noreferrer">Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0)</a>
                </span>
            </div>
        </div>
    )
}

export default ListWord
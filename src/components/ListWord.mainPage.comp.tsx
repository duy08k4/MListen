// Libraries
import React, { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow } from "@tauri-apps/api/window";

// Import type
import { Word, SetStructure } from "../types/DataStructure"

// Import component
// import Listen from "./Listen.mainPage.comp"

// Import custom hook
import { useDebounce } from "../customHooks/debounce"

// Import method system file
import { changeSetName, readFile } from "../tauri_method/tauri_method"

// Import redux
import { useDispatch, useSelector } from "react-redux"
import { changeStatus_newSet } from "../redux/active"
import { RootState } from "../redux/store"

// Import handler
import { toggleButton_ListWord } from "../handler/handler_ListWord/toggleButton_ListWord";
import { handler_ListWord } from "../handler/handler_ListWord/handler_ListWord"

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
    const [recentTargetLink, setRecentTargetLink] = useState<string>("")
    const webviewRef = useRef<WebviewWindow | null>(null);

    // Data
    const [nameSet, setNameSet] = useState<string>(objSet.name ?? "")
    const [idSet, setIdSet] = useState<string>("")
    const [words, setWords] = useState<Word[]>([])
    const [keySearch, setKeySearch] = useState<string>("")
    const [wordsSearch, setWordsSearch] = useState<Word[]>([])
    const [recentWord, setRecentWord] = useState<Word | null>(null)

    const [listWordDelete, setListWordDelete] = useState<Array<boolean>>(words.map(() => false))
    const [newWord, setNewWord] = useState<Word>({
        word: "",
        transcription: "",
        id: "",
        partOfSpeech: "",
        meaning: ""
    })

    const partOfSpeechList = useRef<string[]>(["noun", "verb", "adjective", "adverb"])

    // Redux
    const dispatch = useDispatch()
    const state_newWord = useSelector((state: RootState) => state.activeAction.newWord)

    // Debounce
    const debounce_nameSet = useDebounce(nameSet, 1000)
    const debounce_newWord = useDebounce(newWord, 500)
    const debounce_keySearch = useDebounce(keySearch, 500)

    useEffect(() => {
        if (objSet.id !== idSet) {
            setListenMode(false)
        }
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

    // Toggle button
    const {
        toggleChooseAll,
        toggleDeleteWord,
        chooseDeleteWord,
        chooseTagDeleteWord,
        toggleAddNewWord,
        toggleListen
    } = toggleButton_ListWord(
        {
            isDeleteWord,
            listWordDelete,
            state_newWord,
            isAddNewWord,
            listenMode,
            words
        },
        {
            setIsDeleteWord,
            setListWordDelete,
            setIsAddNewWord,
            setListenMode
        }
    )

    // Handler
    const {
        searchWord,
        handleAddANewWord,
        handleInputNewWord,
        handleDeleteWord,
        handleDeleteSet,
        handleSound
    } = handler_ListWord(
        {
            debounce_keySearch,
            words,
            newWord,
            idSet,
            listWordDelete,
            isAddNewWord,
            isDeleteWord,
            listenMode
        },
        {
            setWordsSearch,
            setNewWord,
            setRecentWord
        },
        {
            toggleAddNewWord,
            toggleDeleteWord
        }
    )

    useEffect(() => {
        setRecentWord(null)
    }, [listenMode])

    // Search word
    useEffect(() => searchWord(), [debounce_keySearch])


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
                }).catch(() => {
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

    // Learn More
    const handleLearnMore = () => {
        if (recentWord && recentWord.targetLink) {
            openLink(recentWord.targetLink)
            setRecentTargetLink(recentWord.targetLink)
        } else {
            toast.info(`Please choose a word.`, {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }
    }

    function openLink(url: string, label?: string) {
        if (webviewRef.current && url === recentTargetLink) {
            webviewRef.current.setFocus();
            return;
        } else {
            if (webviewRef.current && url !== recentTargetLink) {
                webviewRef.current.close();
                webviewRef.current = null;
                setWebviewWindowTrigger(!webviewWindowTrigger)
            }
        }

        const webviewWindowLabel = label ? label : "cambridge"

        const webview = new WebviewWindow(webviewWindowLabel, {
            url: url,
            title: 'MListen - Cambridge Dictionary',
            minWidth: 600,
            minHeight: 700,
            maxWidth: 700,
            maxHeight: 800,
            width: 600,
            height: 700
        });

        webview.once('tauri://created', () => {
            console.log('Webview created');
        });

        webview.once('tauri://error', (e) => {
            console.error('Webview error', e);
        });

        webview.once('tauri://close-requested', () => {
            webview.close()
            // webviewRef.current = null;
            setWebviewWindowTrigger(!webviewWindowTrigger)
            setRecentTargetLink("");
        });

        // console.log(webview)
        webviewRef.current = webview;
        setWebviewWindowTrigger(!webviewWindowTrigger)
        setRecentTargetLink(url);
    }

    // Dictionary
    const handleOpenDictionary = () => {
        const url = "https://dictionary.cambridge.org/vi/dictionary/english"
        openLink(url, "dictionary")
    }

    // Close sub window
    const [webviewWindowTrigger, setWebviewWindowTrigger] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            await getCurrentWindow().onCloseRequested(async () => {
                if (webviewRef.current) {
                    webviewRef.current.destroy();
                }
                console.log(webviewRef.current)
            });

        })()
    }, [])

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
                        !statusDelete && (
                            <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-red py-[10px] px-[20px] rounded-[5px]" onClick={handleDeleteSet}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>

                                Delete Collection
                            </button>
                        )
                    )}
                </div>

                <div className="flex gap-2.5 items-center">
                    <button className={`text-normalSize font-medium text-white flex items-center gap-2.5 ${listenMode ? "bg-red" : "bg-blue"} py-[10px] px-[20px] rounded-[5px]`} onClick={toggleListen}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>

                        {listenMode ? "Turn Off Listen Mode" : "Listen Mode"}
                    </button>

                    {!listenMode && (
                        <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-orange py-[10px] px-[20px] rounded-[5px]" onClick={handleOpenDictionary}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>

                            Open Dictionary
                        </button>
                    )}
                </div>
            </div>

            <div className="ListWord__list w-full h-[calc(100%-140px)] bg-white flex flex-col gap-2.5 shadow-[0px_0px_5px_#d3d3d3] rounded-[10px] px-[20px] pt-5">



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

                    <div className="w-fit h-fit flex items-center gap-5">
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
                                <button className="text-white bg-orange flex items-center gap-2.5 px-5 rounded-[5px] py-2.5" onClick={handleLearnMore}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-3 stroke-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>

                                    Learn More
                                </button>
                            </>
                        )}

                    </div>
                </div>

                <div className="TIPs flex items-center gap-2.5 bg-blue-rgb px-5 py-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" className="size-4 fill-blue">
                        <path d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z" />
                    </svg>

                    <p className="font-medium">
                        Double click on a word and click the <u className="text-blue"><b className="text-blue">Learn More</b></u> button to learn more about the word.
                    </p>
                </div>

                <table className="w-full">
                    <tbody className="">
                        {isAddNewWord && (
                            <tr className="leading-[3] bg-[#f5f5f5]">
                                <td className="text-center py-2.5">
                                    <button className="h-[50px] w-full bg-green flex justify-center items-center px-2.5" onClick={handleAddANewWord}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="size-4 fill-white">
                                            <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
                                        </svg>
                                    </button>
                                </td>
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
                                    <tr key={index} className={`leading-[3] border-b-[0.5px] border-b-lightGrayy hover:bg-[#f5f5f5] hover:cursor-grab ${recentWord && recentWord.id == data.id ? "border-l-8 border-l-green" : ""}`} onClick={() => { chooseTagDeleteWord(index) }} onDoubleClick={() => { handleSound(data) }}>
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
                                    <tr key={index} className={`leading-[3] border-b-[0.5px] border-b-lightGrayy hover:bg-[#f5f5f5] hover:cursor-grab ${recentWord && recentWord.id == data.id ? "border-l-8 border-l-green" : ""}`} onClick={() => { chooseTagDeleteWord(index) }} onDoubleClick={() => { handleSound(data) }}>
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

            <div className="h-[60px] flex gap-5 justify-center items-center">
                <span className="text-normalSize flex gap-1.5 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 stroke-3">
                        <path d="M15.75 8.25a.75.75 0 0 1 .75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 1 1-.992-1.124A2.243 2.243 0 0 0 15 9a.75.75 0 0 1 .75-.75Z" />
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM4.575 15.6a8.25 8.25 0 0 0 9.348 4.425 1.966 1.966 0 0 0-1.84-1.275.983.983 0 0 1-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 0 1 2.328-.377L16.5 15h.628a2.25 2.25 0 0 1 1.983 1.186 8.25 8.25 0 0 0-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.575 15.6Z" clipRule="evenodd" />
                    </svg>

                    <a href="https://my-portfolio-duytrans-projects-ad2c698e.vercel.app/" className="font-bold underline italic" target="_blank" rel="noopener noreferrer">Who is dDev?</a>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 stroke-3">
                        <path d="M15.75 8.25a.75.75 0 0 1 .75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 1 1-.992-1.124A2.243 2.243 0 0 0 15 9a.75.75 0 0 1 .75-.75Z" />
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM4.575 15.6a8.25 8.25 0 0 0 9.348 4.425 1.966 1.966 0 0 0-1.84-1.275.983.983 0 0 1-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 0 1 2.328-.377L16.5 15h.628a2.25 2.25 0 0 1 1.983 1.186 8.25 8.25 0 0 0-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.575 15.6Z" clipRule="evenodd" />
                    </svg>

                </span>
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
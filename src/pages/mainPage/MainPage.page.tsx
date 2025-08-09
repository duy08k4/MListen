// Import libraries
import React, { useEffect, useRef, useState } from "react"

// Import images
// import AppLogo from "../../assets/LogoApp.png"

// Import component
import Empty from "../../components/Empty.mainPage.comp"
import ListWord from "../../components/ListWord.mainPage.comp"
import NewSet from "../../components/NewSet.mainPage.comp"

// Import redux
import { ToastContainer } from "react-toastify"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"

// Import method system file
import { readFile } from "../../tauri_method/tauri_method"

// Import type
import { SetStructure } from "../../types/DataStructure"

const MainPage: React.FC = () => {
    // State
    const [isDelete, setIsDelete] = useState<boolean>(false)
    const [isNewSet, setIsNewSet] = useState<boolean>(false)
    const [renderedComponent, setRenderedComponent] = useState<"listWord" | "empty">("empty")

    // Set data
    const [dataSet, setDataSet] = useState<SetStructure[]>([])
    const [listChoose, setListChoose] = useState<Array<boolean>>(dataSet.map(() => false))
    const [chooseSet, setChooseSet] = useState<SetStructure>({
        id: "",
        name: "",
        originalName: "",
        timeCreate: "",
        timeUpdate: ""
    })

    // Redux
    const newSet_state = useSelector((state: RootState) => state.activeAction.newSet)
    const state_newWord = useSelector((state: RootState) => state.activeAction.newWord)

    // Effect
    useEffect(() => {
        (async () => {
            const data = await readFile<SetStructure>()
            setDataSet(data)

            if (chooseSet.id) {
                const newData = data.filter(set => set.id === chooseSet.id)[0]
                setChooseSet(newData)
            }
        })()
    }, [newSet_state, state_newWord])

    // Toggle
    const toggleDeleteButton = () => {
        const toggleValue = !isDelete

        if (!toggleValue) {
            const newListChoose = listChoose.map(() => false)
            setListChoose([...newListChoose])
        }

        setIsDelete(toggleValue)
    }

    const toggleDeleteTag = (index: number) => {
        const toggleValue = !listChoose[index]

        if (typeof toggleValue === "boolean") {
            const listChoose_copy = listChoose
            listChoose_copy[index] = toggleValue
            setListChoose([...listChoose_copy])
        }
    }

    const toggleAddNewSet = () => {
        setIsNewSet(!isNewSet)
    }

    // Change

    const changeChooseAll = (checked: boolean) => {
        if (checked) {
            const newList = listChoose.map(() => true)
            setListChoose([...newList])
        } else {
            const newList = listChoose.map(() => false)
            setListChoose([...newList])
        }
    }

    // Handler
    const chooseTag = (index: number, objSet: SetStructure) => {
        if (isDelete) {
            toggleDeleteTag(index)
            return
        } else {
            setChooseSet(objSet)
            setRenderedComponent("listWord")
        }
    }

    return (
        <div className="MainPage relative h-full w-full flex bg-[#f5f5f5]">
            <div className="MainPage__listWordSet h-full w-[20%] bg-white shadow-[4px_0px_10px_#d3d3d3] flex flex-col">

                <div className="MainPage__listWordSet--basicalFunc flex flex-col gap-5 px-[20px] pt-[20px] pb-[10px]">
                    <div className="h-fit w-full flex justify-between items-center">
                        <p className="text-mediumSize font-semibold">Main</p>

                        <div className="flex items-center gap-2.5">
                            <button className="bg-green px-5 py-1 rounded-[5px]" title="Create" onClick={toggleAddNewSet}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 stroke-white stroke-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                </svg>

                            </button>

                            <button className="bg-red px-5 py-1 rounded-[5px]" title="Delete" onClick={toggleDeleteButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 stroke-white stroke-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <p className="text-grayy font-medium">Amount:</p>
                        <p className="text-grayy font-medium">{dataSet.length} set</p>
                    </div>
                </div>

                <div className="MainPage__listWordSet--list w-full flex-1 flex flex-col gap-2.5 px-[10px] py-[10px]">
                    {dataSet.map((data, index) => (
                        <div
                            key={index}
                            className="MainPage__tagSet flex items-center gap-5 bg-white px-5 py-4 rounded-[10px] border-[0.5px] border-lightGrayy hover:bg-[#f5f5f5] hover:cursor-grab active:cursor-grabbing"
                            onClick={() => { chooseTag(index, data) }}
                            title={data.name}
                        >
                            {isDelete && (
                                <div className="">
                                    <input type="checkbox" onChange={() => { toggleDeleteTag(index) }} checked={listChoose[index]} />
                                </div>
                            )}

                            <div className="flex-1 h-fit">
                                <div className="flex flex-col">
                                    <p className="w-4/5 select-none text-mediumSize font-medium truncate">{data.name}</p>
                                    <p className="select-none flex text-normalSize items-center gap-1.5 font-normal text-grayy">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-2 stroke-grayy">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        {data.timeUpdate}
                                    </p>
                                </div>

                            </div>
                        </div>

                    ))}

                </div>

                {isDelete && (
                    <div className="MainPage__listWordSet__confirmDelete">
                        <div className="h-fit w-full flex gap-2 items-center px-[10px]">
                            <input id="chooseAll" type="checkbox" onChange={(e) => { changeChooseAll(e.target.checked) }} />
                            <label htmlFor="chooseAll" className="select-none h-fit w-[40%] text-undermediumSize font-medium">All</label>
                        </div>

                        <div className="h-fit w-full flex gap-2.5 bg-white px-[10px] py-[10px]">
                            <button className="flex-1 h-fit text-undermediumSize font-medium bg-lightGrayy py-2.5 rounded-[10px]" onClick={toggleDeleteButton}>Cancel</button>
                            <button className="flex-1 h-fit text-undermediumSize font-medium text-white bg-red py-2.5 rounded-[10px]">Delete</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="MainPage--main flex-1 bg-[transparent] !px-padding-xy pt-padding-y overflow-y-auto">
                {renderedComponent === "listWord" && <ListWord objSet={chooseSet} />}
                {renderedComponent === "empty" && <Empty />}
            </div>

            {isNewSet && (<NewSet toggleNewSetForm={toggleAddNewSet} />)}

            <ToastContainer />
        </div>
    )
}

export default MainPage
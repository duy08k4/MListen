// Libraries
import React, { useState } from "react"

const ListWord: React.FC = () => {
    // State
    const [changeHistory, setChaneHistory] = useState<Array<string>>([])


    // Data
    const [nameSet, setNameSet] = useState("Undefile Name")


    return (
        <div className="ListWord h-full w-full bg-[transparent] flex flex-col gap-2.5 ">
            <div className="ListWord__functionContainer w-full h-[80px] bg-white flex items-center gap-5 shadow-[0px_0px_5px_#d3d3d3] rounded-[10px] px-[20px]">
                <div className="h-full flex gap-1.5 flex-col justify-center">
                    <input type="text" className="text-mediumSize font-medium outline-lightGrayy bg-[#dadada] px-[10px] py-[5px] rounded-[5px]" value={nameSet} />
                    {/* <p className="text-mediumSize font-medium">{nameSet}</p> */}
                    <p className="text-normalSize font-medium text-grayy">100 words</p>
                </div>

                <div className="flex-1 flex gap-2.5">
                    <button className="text-normalSize font-medium flex items-center gap-2.5 bg-lightGrayy py-[10px] px-[20px] rounded-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>

                        Refresh
                    </button>

                    <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-green py-[10px] px-[20px] rounded-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
                        </svg>

                        Save
                    </button>

                    <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-red py-[10px] px-[20px] rounded-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>

                        Delete Set
                    </button>
                </div>

                <div className="flex gap-2.5">
                    <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-blue py-[10px] px-[20px] rounded-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>

                        Listen
                    </button>

                    <button className="text-normalSize font-medium text-white flex items-center gap-2.5 bg-orange py-[10px] px-[20px] rounded-[5px]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 stroke-white stroke-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>

                        Dictation
                    </button>
                </div>
            </div>

            <div className="ListWord__list w-full flex-1 bg-white shadow-[0px_0px_5px_#d3d3d3] rounded-tl-[10px] rounded-tr-[10px]">

            </div>
        </div>
    )
}

export default ListWord
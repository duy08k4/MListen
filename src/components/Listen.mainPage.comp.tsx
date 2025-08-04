// Libraries
import React, { useState } from "react"

interface listen {
    closeListen: () => void
}

const Listen: React.FC<listen> = ({ closeListen }) => {
    // State
    const [isMeaning, setIsMeaning] = useState<boolean>(false)

    return (
        <div className="Listen absolute h-full w-full bg-[#f5f5f5] flex justify-center items-center shadow-[0px_0px_5px_#d3d3d3] rounded-[10px]">
            <div className="w-full flex justify-between items-center px-5">
                <button className="h-fit text-white font-medium flex items-center gap-2.5 bg-red py-2.5 px-5 rounded-[5px]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                    </svg>
                    Previous
                </button>

                <div className="flex flex-col items-center gap-2.5">
                    {!isMeaning ? (
                        <>
                            <h1 className="text-hugeSige font-medium">Custom</h1>
                            <p className="text-bigSize">/'kəstəm/</p>
                            <p className="text-mediumSize">Part of speech: <b>Noun</b></p>
                        </>
                    ) : (
                        <p className="text-hugeSige font-medium">Phong tục</p>
                    )}
                </div>

                <button className="h-fit text-white font-medium flex items-center gap-2.5 bg-green py-2.5 px-5 rounded-[5px]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                    Next
                </button>
            </div>


            <div className="absolute bottom-[200px] left-1/2 translate-[-50%] flex items-center gap-5">
                <button className="text-white font-medium flex items-center gap-2.5 bg-[red] py-2.5 px-5 rounded-[5px]" onClick={ closeListen }>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                    </svg>


                    Stop
                </button>

                <button className="font-medium flex items-center gap-2.5 bg-orange py-2.5 px-5 rounded-[5px]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>


                    Listen again
                </button>

                <button className="text-white font-medium flex items-center gap-2.5 bg-grayy py-2.5 px-5 rounded-[5px]" onClick={() => { setIsMeaning(!isMeaning) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 stroke-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                    </svg>

                    {isMeaning ? "Hide meaning" : "Show meaning"}
                </button>
            </div>
        </div>
    )
}

export default Listen
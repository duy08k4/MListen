// Import libraries
import React, { useState } from "react"
import { format } from 'date-and-time';
import { ToastContainer, toast } from "react-toastify";


interface newSet {
    toggleNewSetForm: () => void
}

const NewSet: React.FC<newSet> = ({ toggleNewSetForm }) => {
    // Data
    const [nameSet, setNameSet] = useState<string>("")

    // Handler
    const createSet = () => {
        const now = new Date()
        const time = format(now, 'ddd, MMM DD YYYY HH:mm');
    }

    return (
        <div className="NewSet absolute top-0 left-0 h-full w-full bg-[rgba(0,0,0,0.75)] flex justify-center items-center">
            <div className="NewSetForm w-[30%] h-fit bg-white flex flex-col gap-2.5 rounded-[10px] px-[40px] py-[40px]">

                <div className="h-fit w-full flex justify-center items-center">
                    <h1 className="text-bigSize font-medium">Name's Set</h1>
                </div>

                <div>
                    <input
                        type="text"
                        className="outline-none w-full px-5 py-2.5 border border-lightGrayy rounded-[5px]"
                        placeholder="Let name your set..."
                        onChange={(e) => { setNameSet(e.target.value) }}
                    />
                </div>

                <div className="flex items-center gap-2.5">
                    <button className="w-[30%] bg-[#eeeeee] py-2.5 rounded-[5px]" onClick={toggleNewSetForm}>Cancel</button>
                    <button className="font-medium text-white flex-1 bg-green py-2.5 rounded-[5px]" onClick={createSet}>Create</button>
                </div>
            </div>

            <ToastContainer />
        </div>
    )
}

export default NewSet
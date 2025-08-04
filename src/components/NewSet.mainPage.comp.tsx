// Import libraries
import React from "react"

interface newSet {
    toggleNewSetForm: () => void
}

const NewSet: React.FC<newSet> = ({ toggleNewSetForm }) => {
    return (
        <div className="NewSet absolute top-0 left-0 h-full w-full bg-[rgba(0,0,0,0.75)] flex justify-center items-center">
            <div className="NewSetForm w-[30%] h-fit bg-white flex flex-col gap-2.5 rounded-[10px] px-[40px] py-[40px]">

                <div className="h-fit w-full flex justify-center items-center">
                    <h1 className="text-bigSize font-medium">Name's Set</h1>
                </div>

                <div className="">
                    <input type="text" className="outline-none w-full px-5 py-2.5 border border-lightGrayy rounded-[5px]" placeholder="Let name your set..."/>
                </div>

                <div className="flex items-center gap-2.5">
                    <button className="w-[30%] bg-[#eeeeee] py-2.5 rounded-[5px]" onClick={toggleNewSetForm}>Cancel</button>
                    <button className="font-medium text-white flex-1 bg-green py-2.5 rounded-[5px]">Create</button>
                </div>
            </div>
        </div>
    )
}

export default NewSet
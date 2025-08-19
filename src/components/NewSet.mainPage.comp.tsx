// Import libraries
import React, { useEffect, useRef, useState } from "react"
import { format } from 'date-and-time';
import { toast } from "react-toastify";
import { v4 } from "uuid"

// Import method
import { addANewSet } from "../core/addNewSet";

// Import type
import { SetStructure } from "../types/DataStructure";

// Import redux
import { changeStatus_newSet } from "../redux/active";
import { useDispatch } from "react-redux";


interface newSet {
    toggleNewSetForm: () => void
}

const NewSet: React.FC<newSet> = ({ toggleNewSetForm }) => {
    // State
    const [enableCreateBtn, setEnableCreateBtn] = useState<boolean>(false)

    // Redux
    const dispatch = useDispatch()

    // Data
    const [nameSet, setNameSet] = useState<string>("")

    // Condition
    type nameSetCondition = {
        conditionText: string,
        conditionKey: string
    }

    const nameSetCondition = useRef<Array<nameSetCondition>>([
        { conditionText: "Valid name", conditionKey: "validName" },
        { conditionText: "5 to 40 characters", conditionKey: "nameLength" },
        { conditionText: "Cannot end with a period or space", conditionKey: "endCharacter" },
        { conditionText: `Does not contain the following characters: \\ / : * ? \" < > |`, conditionKey: "specialCharater" }
    ])
    const [nameSetConditionCheck, setNameSetConditionCheck] = useState<Array<boolean>>(nameSetCondition.current.map(() => false))

    useEffect(() => {
        // const conditionCheck = [...nameSetConditionCheck]
        if (!nameSet) {
            setNameSetConditionCheck(nameSetCondition.current.map(() => false))
            return
        }

        const conditionCheck = nameSetCondition.current.map((condition) => {
            const conditionKey = condition.conditionKey

            switch (conditionKey) {
                case "validName":
                    const reservedNames = [
                        "CON", "PRN", "AUX", "NUL",
                        "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
                        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9", import.meta.env.VITE_ALL_SET
                    ];
                    const upperText = nameSet.toUpperCase();
                    return !reservedNames.includes(upperText);

                case "nameLength":
                    return (nameSet.length <= 40 && nameSet.length >= 5);

                case "endCharacter":
                    return !(nameSet.endsWith(' ') || nameSet.endsWith('.'));

                case "specialCharater":
                    const forbiddenChars = /[\\\/:\*\?"<>\|]/;
                    return !forbiddenChars.test(nameSet);

                default:
                    return false;
            }
        })

        setNameSetConditionCheck(conditionCheck)

    }, [nameSet])

    // Handler
    const createSet = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setEnableCreateBtn(true)

        if (nameSet && !nameSetConditionCheck.includes(false)) {
            const now = new Date()
            const data: SetStructure = {
                name: nameSet,
                originalName: nameSet,
                id: `mlisten_${v4()}`,
                timeCreate: format(now, 'ddd, MMM DD YYYY HH:mm'),
                timeUpdate: format(now, 'ddd, MMM DD YYYY HH:mm')
            }

            const toastID = toast.loading('Adding your set...', {
                position: "bottom-right",
                autoClose: false,
                theme: "light",
            });
            await addANewSet(data).then(() => {
                toast.dismiss(toastID)
                toast.success('Set added', {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });

                toggleNewSetForm()
            }).catch((error) => {
                toast.dismiss(toastID)
                toast.error('Failed to add', {
                    position: "bottom-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    theme: "light",
                });
                throw Error(error)
            }).finally(() => {
                setEnableCreateBtn(false)
                dispatch(changeStatus_newSet())
            })
        } else {
            toast.warn("Please check  the name again", {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
        }
    }

    return (
        <div className="NewSet absolute top-0 left-0 h-full w-full bg-[rgba(0,0,0,0.75)] flex justify-center items-center">
            <form onSubmit={createSet} className="NewSetForm w-[35%] h-fit bg-white flex flex-col gap-2.5 rounded-[10px] px-[40px] py-[40px]">

                <div className="h-fit w-full flex justify-center items-center">
                    <h1 className="text-bigSize font-medium">Name</h1>
                </div>

                <div>
                    <input
                        type="text"
                        className="outline-none w-full px-5 py-2.5 border border-lightGrayy rounded-[5px]"
                        placeholder="Let name your set..."
                        onChange={(e) => { setNameSet(e.target.value) }}
                        autoFocus
                    />
                </div>

                <div className="w-full h-fit px-5">
                    <ul className="w-full h-fit">
                        {nameSetCondition.current.map((value, index) => {
                            return (
                                <li key={index} className="flex items-center gap-2.5 leading-[2]">
                                    {nameSetConditionCheck[index] ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="size-4 fill-green">
                                            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="size-4 fill-red">
                                            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                                        </svg>
                                    )}
                                    <p className={`text-undermediumSize ${nameSetConditionCheck[index] ? "text-green" : "text-red"} font-medium`}>{value.conditionText}</p>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <div className="flex items-center gap-2.5">
                    <button type="button" className="w-[30%] bg-[#eeeeee] py-2.5 rounded-[5px]" onClick={toggleNewSetForm} disabled={enableCreateBtn} >Cancel</button>
                    <button type="submit" className="font-medium text-white flex-1 bg-green py-2.5 rounded-[5px]" disabled={enableCreateBtn} >Create</button>
                </div>
            </form>


        </div>
    )
}

export default NewSet
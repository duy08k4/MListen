// Import libraries
import React from "react"
import { toast } from "react-toastify"

type values = {
    isDelete: boolean,
    state_deleteSet: boolean,
    listChoose: Array<boolean>,
    isNewSet: boolean
}

type stateSetter = {
    setListChoose: React.Dispatch<React.SetStateAction<Array<boolean>>>,
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
    setIsNewSet: React.Dispatch<React.SetStateAction<boolean>>
}

export function toggleButton_MainPage(values: values, stateSetter: stateSetter) {
    const {
        isDelete, listChoose, state_deleteSet, isNewSet
    } = values
    const {
        setListChoose, setIsDelete, setIsNewSet
    } = stateSetter

    // Delete mode
    const toggleDeleteButton = React.useCallback(() => {
        const toggleValue = !isDelete

        if (!toggleValue) {
            const newListChoose = listChoose.map(() => false)
            setListChoose([...newListChoose])
        }

        if (!state_deleteSet) {
            setIsDelete(toggleValue)
        } else {
            toast.warn('Your collection is being progressed', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
            return
        }
    }, [isDelete, state_deleteSet])

    // Choose tag for delete
    const toggleDeleteTag = React.useCallback((index: number) => {
        const toggleValue = !listChoose[index]

        if (typeof toggleValue === "boolean") {
            const listChoose_copy = listChoose
            listChoose_copy[index] = toggleValue
            setListChoose([...listChoose_copy])
        }
    }, [listChoose])

    // Toggle add a new set
    const toggleAddNewSet = React.useCallback(() => {
        setIsNewSet(!isNewSet)
    }, [isNewSet])

    // Choose (all) tag for delete
    const changeChooseAll = React.useCallback((checked: boolean) => {
        if (checked) {
            const newList = listChoose.map(() => true)
            setListChoose([...newList])
        } else {
            const newList = listChoose.map(() => false)
            setListChoose([...newList])
        }
    }, [listChoose])

    

    return {
        toggleDeleteButton,
        toggleDeleteTag,
        toggleAddNewSet,
        changeChooseAll
    }
}
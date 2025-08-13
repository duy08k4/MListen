// Import libraries
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"

// Import redux
import { changeStatus_deleteSet } from "../../redux/active"

// Import type
import { SetStructure } from "../../types/DataStructure"

// Import tauri method
import { removeSet } from "../../tauri_method/tauri_method"
import React from "react"

type values = {
    dataSet: SetStructure[],
    listChoose: Array<boolean>,
    chooseSet: SetStructure
}

type stateSetter = {
    setChooseSet: React.Dispatch<React.SetStateAction<SetStructure>>
}

type func = {
    toggleDeleteButton: () => void
}

export function handler_MainPage(values: values, stateSetter: stateSetter, func: func) {
    const dispatch = useDispatch()

    const { dataSet, listChoose, chooseSet } = values
    const { setChooseSet } = stateSetter
    const { toggleDeleteButton } = func

    // Delete set
    const handleDeleteSet = React.useCallback(async () => {
        let listDelete = dataSet.map((set, index) => listChoose[index] ? set.id : null).filter(value => value) as string[]

        if (listDelete.length === 0) {
            toast.warn('Please choose at least one collection', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });
            return
        }

        toggleDeleteButton()

        const proccessToast = toast.loading(`Deleting...`, {
            position: "bottom-right",
            autoClose: false,
            closeOnClick: false,
            theme: "light",
        });

        dispatch(changeStatus_deleteSet(true))

        await removeSet(listDelete).then(() => {
            toast.dismiss(proccessToast)
            toast.success('Deleted', {
                position: "bottom-right",
                autoClose: 5000,
                closeOnClick: true,
                theme: "light",
            });

            if (listDelete.includes(chooseSet.id)) {
                setChooseSet({
                    id: "",
                    name: "",
                    originalName: "",
                    timeCreate: "",
                    timeUpdate: ""
                })
            }
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
    }, [listChoose])


    return {
        handleDeleteSet
    }
}
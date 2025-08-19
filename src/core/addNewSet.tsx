// Import libraries
import {
    readTextFile,
    exists,
    BaseDirectory,
    create,
    mkdir
} from '@tauri-apps/plugin-fs';

import { join, documentDir } from '@tauri-apps/api/path';

// Import type
import { SetStructure } from '../types/DataStructure';

// Import function
import { writeFile } from './writeFile';


// Add a set file
export async function createSetFile(setName: string): Promise<void> {
    const path = import.meta.env.VITE_SET_DIRECT
    const isFolderApp = await exists(path, { baseDir: BaseDirectory.Document }).catch((err) => {
        console.error(err)
        throw Error(err)
    })

    if (isFolderApp) {
        await create(`${path}/${setName}.json`, { baseDir: BaseDirectory.Document }).catch((err) => {
            console.error(err)
            throw Error(err)
        }).then(async () => {
            const documentPath = await documentDir()
            const pathData = await join(documentPath, `${path}/${setName}.json`)

            await writeFile(pathData, JSON.stringify([])).catch((err) => {
                console.error(err)
                throw Error(err)
            })
        })
    } else {
        await mkdir(import.meta.env.VITE_SET_DIRECT, { baseDir: BaseDirectory.Document }).catch((err) => {
            console.error(err)
            throw Error(err)
        })
            .then(async () => {
                await create(`${path}/${setName}.json`, { baseDir: BaseDirectory.Document }).catch((err) => {
                    console.error(err)
                    throw Error(err)
                }).then(async () => {
                    const documentPath = await documentDir()
                    const pathData = await join(documentPath, `${path}/${setName}.json`)

                    await writeFile(pathData, JSON.stringify([])).catch((err) => {
                        console.error(err)
                        throw Error(err)
                    })
                })
            })
    }
}


// Add a new set into main file
export async function addANewSet(setData: SetStructure): Promise<void> {
    const folderApp = import.meta.env.VITE_FOLDER_NAME
    const mainFile = import.meta.env.VITE_ALL_SET
    const path = folderApp + "/" + mainFile
    const isFolderApp = await exists(folderApp, { baseDir: BaseDirectory.Document }).catch((err) => {
        console.error(err)
        throw Error(err)
    })

    if (!isFolderApp) {
        await mkdir(folderApp, { baseDir: BaseDirectory.Document })
            .then(async () => {
                await create(path, { baseDir: BaseDirectory.Document }).catch((err) => {
                    console.error(err)
                    throw Error(err)
                })
            })

            .catch((err) => {
                console.error(err)
                throw Error(err)
            })
    }

    const readData = await readTextFile(path, { baseDir: BaseDirectory.Document })

    if (readData) { // Had data
        const oldData = JSON.parse(readData)
        const newData = [setData, ...oldData]
        const documentPath = await documentDir()
        const pathData = await join(documentPath, path)
        await writeFile(pathData, JSON.stringify(newData)).catch((err) => {
            console.error(err)
            throw Error(err)
        })

    } else { // Empty
        const newData = [setData]
        const documentPath = await documentDir()
        const pathData = await join(documentPath, path)
        await writeFile(pathData, JSON.stringify(newData)).catch((err) => {
            console.error(err)
            throw Error(err)
        })
    }

    await createSetFile(setData.id)
}
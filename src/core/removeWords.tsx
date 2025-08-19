// Import libraries
import {
    exists,
    BaseDirectory,
} from '@tauri-apps/plugin-fs';

import { join, documentDir } from '@tauri-apps/api/path';

import { format } from 'date-and-time';

// Import type
import { SetStructure } from '../type/DataStructure';

// Import functions
import { readFile } from './readFile';
import { writeFile } from './writeFile';


// Remove word
export async function deleteWord(setId: string, listWordDelete: string[]): Promise<void> {
    if (setId && listWordDelete.length > 0) {
        const path = import.meta.env.VITE_SET_DIRECT + "/" + `${setId}.json`
        const check = await exists(path, { baseDir: BaseDirectory.Document })

        if (check) {
            const listWord = await readFile(setId).catch((err) => {
                console.error(err)
                throw Error(err)
            })

            const listWordWithoutDelete = listWord.filter(word => !listWordDelete.includes(word.id))
            const documentPath = await documentDir()
            // const pathData = await join(documentPath, import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET)
            const pathData = await join(documentPath, path)

            await writeFile(pathData, JSON.stringify(listWordWithoutDelete)).catch((err) => {
                console.error(err)
                throw Error(err)
            }).then(async () => {
                const allSet = await readFile<SetStructure>()
                const listWithoutTarget = allSet.filter(set => set.id !== setId)
                const target = allSet.filter(set => set.id === setId)[0]
                const now = new Date()
                target.timeUpdate = format(now, 'ddd, MMM DD YYYY HH:mm')

                const newListData = [target, ...listWithoutTarget]
                const documentPath = await documentDir()
                const pathData = await join(documentPath, import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET)

                await writeFile(pathData, JSON.stringify(newListData)).catch((err) => {
                    console.error(err)
                    throw Error(err)
                })
            })
        } else {
            throw Error(`Forbidden path: ${path}`)
        }
    } else {
        throw Error("Empty parameters")
    }
}
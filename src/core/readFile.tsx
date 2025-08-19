// Import libraries
import {
  readTextFile,
  writeTextFile,
  exists,
  remove,
  BaseDirectory,
  create,
  mkdir
} from '@tauri-apps/plugin-fs';

import { join, documentDir } from '@tauri-apps/api/path';

import { format } from 'date-and-time';

// Import type
import { Word, SetStructure } from '../type/DataStructure';

// Read file
export async function readFile<T extends Word | SetStructure>(fileName?: string): Promise<T[]> {
    const checkPath = import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET
    const check = await exists(checkPath, { baseDir: BaseDirectory.Document })
    if (!check) return JSON.parse("[]")

    if (!fileName) {
        const path = import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET
        const data = await readTextFile(path, { baseDir: BaseDirectory.Document }).catch((err) => {
            console.log(err)
            throw Error(err)
        })

        return JSON.parse(data)
    } else {
        const path = import.meta.env.VITE_SET_DIRECT + "/" + `${fileName}.json`
        const checkFile = await exists(path, { baseDir: BaseDirectory.Document })

        if (checkFile) {
            const data = await readTextFile(path, { baseDir: BaseDirectory.Document }).catch((err) => {
                console.log(err)
                throw Error(err)
            })

            return JSON.parse(data)
        } else return JSON.parse("[]")
    }
}
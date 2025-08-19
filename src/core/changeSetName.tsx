// Import libraries
import {
    readTextFile,
    BaseDirectory,
} from '@tauri-apps/plugin-fs';

import { join, documentDir } from '@tauri-apps/api/path';

import { format } from 'date-and-time';

// Import type
import { SetStructure } from '../types/DataStructure';

// Import functions
import { writeFile } from './writeFile';

// Change set name
export async function changeSetName(newName: string, setId: string): Promise<void> {
    const path = import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET
    const data = await readTextFile(path, { baseDir: BaseDirectory.Document }).catch((err) => {
        console.log(err)
        throw Error(err)
    })

    const listData = JSON.parse(data) as SetStructure[]
    const now = new Date()
    const listWithoutTarget = listData.filter(set => set.id !== setId)
    const target = listData.filter(set => set.id === setId)[0]
    target.name = newName
    target.timeUpdate = format(now, 'ddd, MMM DD YYYY HH:mm')
    const newListData = [target, ...listWithoutTarget]
    const documentPath = await documentDir()
    const pathData = await join(documentPath, path)
    await writeFile(pathData, JSON.stringify(newListData)).catch((err) => {
        console.error(err)
        throw Error(err)
    })
}
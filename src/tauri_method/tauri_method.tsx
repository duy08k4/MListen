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

import { join, resolveResource, documentDir } from '@tauri-apps/api/path';

// Import type
import { Word, SetStructure } from '../types/DataStructure';


// Đọc file
export async function readFile(fileName: string): Promise<string> {
  return fileName
}

// Ghi đè file
export async function writeFile(fileName: string, content: string): Promise<void> {
  await writeTextFile(fileName, content, { baseDir: BaseDirectory.AppData });
}

// Add a new set into main file
export async function addANewSet(setData: SetStructure): Promise<void> {
  // const { id, name, timeCreate } = setData
  const folderApp = import.meta.env.VITE_FOLDER_NAME
  const mainFile = import.meta.env.VITE_ALL_SET
  const path = folderApp + "/" + mainFile
  const isFolderApp = await exists(folderApp, { baseDir: BaseDirectory.Document }).catch((err) => { throw Error(err) })

  if (!isFolderApp) {
    await mkdir(folderApp, { baseDir: BaseDirectory.Document })
    .then(async () => {
      await create(path, { baseDir: BaseDirectory.Document }).catch((err) => { throw Error(err) })
    })

    .catch((err) => { throw Error(err) })
  }

  // console.log(setData)
  const readData = await readTextFile(path, { baseDir: BaseDirectory.Document })

  if (readData) { // Had data

  } else { // Empty
    const newData = [setData]
    const documentPath = await documentDir()
    const pathData = await join(documentPath, path)
    await writeFile(pathData, JSON.stringify(newData)).catch((err) => { throw Error(err) })
  }
  
}

// Add a set file
export async function createSetFilr (): Promise<void> {

}

// Delete file
export async function deleteFile(fileName: string): Promise<void> {
  await remove(fileName, { baseDir: BaseDirectory.AppData });
}

// Delete object in a file
export async function deleteObjectInFile(): Promise<void> {

}

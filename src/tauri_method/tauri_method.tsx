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


// Read file
export async function readFile<T extends Word | SetStructure>(fileName?: string): Promise<T[]> {
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

// Ghi đè file
export async function writeFile(fileName: string, content: string): Promise<void> {
  await writeTextFile(fileName, content, { baseDir: BaseDirectory.Document });
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
    const newData = [...oldData, setData]
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
    await mkdir("mlisten/set", { baseDir: BaseDirectory.Document }).catch((err) => {
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

// Delete file
export async function deleteFile(fileName: string): Promise<void> {
  await remove(fileName, { baseDir: BaseDirectory.Document });
}

// Delete object in a file
export async function deleteObjectInFile(): Promise<void> {

}

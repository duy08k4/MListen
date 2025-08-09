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

import { format } from 'date-and-time';

// Import type
import { Word, SetStructure } from '../types/DataStructure';


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

// Write file
export async function writeFile(fileName: string, content: string): Promise<void> {
  await writeTextFile(fileName, content, { baseDir: BaseDirectory.Document });
}

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

// Add a new word
export async function addANewWord(setId: string, word: Word): Promise<void> {
  const checkPath = import.meta.env.VITE_SET_DIRECT + "/" + `${setId}.json`
  const check = exists(checkPath, { baseDir: BaseDirectory.Document })
  const path = import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET
  const checkFile = await exists(path, { baseDir: BaseDirectory.Document })

  if (!check) throw Error(`${setId}.json does not exists`)
  if (!checkFile) throw Error(`${import.meta.env.VITE_FOLDER_NAME} does not exists`)

  const oldListWord = await readFile(setId)
  const now = new Date()
  const inputWord: Word = { ...word, timeCreate: format(now, 'ddd, MMM DD YYYY HH:mm') }
  const newListWord = [...oldListWord, inputWord]

  const targetPath = import.meta.env.VITE_SET_DIRECT + "/" + `${setId}.json`
  await writeFile(targetPath, JSON.stringify(newListWord)).catch((err) => {
    console.error(err)
    throw Error(err)
  }).then(async () => {
    const allSet = await readFile<SetStructure>()
    const listWithoutTarget = allSet.filter(set => set.id !== setId)
    const target = allSet.filter(set => set.id === setId)[0]
    target.timeUpdate = format(now, 'ddd, MMM DD YYYY HH:mm')

    const newListData = [target, ...listWithoutTarget]
    const documentPath = await documentDir()
    const pathData = await join(documentPath, path)

    await writeFile(pathData, JSON.stringify(newListData)).catch((err) => {
      console.error(err)
      throw Error(err)
    })
  })
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
      console.log(listWordWithoutDelete)
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

// Delete file
export async function deleteFile(fileName: string): Promise<void> {
  await remove(fileName, { baseDir: BaseDirectory.Document });
}

// Delete object in a file
export async function deleteObjectInFile(): Promise<void> {

}

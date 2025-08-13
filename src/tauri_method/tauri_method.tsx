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

// Remove a set
export async function removeSet(listSetId: string[]): Promise<void> {
  const allSetPath = import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET

  const checkAllSetFile = await exists(allSetPath, { baseDir: BaseDirectory.Document })
  const checkSets = await Promise.all(listSetId.map(async (setId) => await exists(import.meta.env.VITE_SET_DIRECT + "/" + `${setId}.json`, { baseDir: BaseDirectory.Document })))

  if (!checkAllSetFile) throw Error(`${import.meta.env.VITE_FOLDER_NAME} does not exists`)
  if (checkSets.includes(false)) throw Error(`Some collection does not exists`)

  const listSet = await readFile<SetStructure>()
  const newListSet = listSet.filter(set => !listSetId.includes(set.id))

  await writeFile(allSetPath, JSON.stringify(newListSet)).then(() => {
    listSetId.forEach(async (setId) => {
      const deletePath = import.meta.env.VITE_SET_DIRECT + "/" + `${setId}.json`
      await deleteFile(deletePath)
    })
  }).catch((err) => {
    console.error(err)
    throw Error(err)
  })
}

// Add a new word
export async function addANewWord(setId: string, word: Word): Promise<void> {
  const checkPath = import.meta.env.VITE_SET_DIRECT + "/" + `${setId}.json`
  const check = exists(checkPath, { baseDir: BaseDirectory.Document })
  const path = import.meta.env.VITE_FOLDER_NAME + "/" + import.meta.env.VITE_ALL_SET
  const checkFile = await exists(path, { baseDir: BaseDirectory.Document })

  if (!check) throw Error(`${setId}.json does not exists`)
  if (!checkFile) throw Error(`${import.meta.env.VITE_FOLDER_NAME} does not exists`)

  const oldListWord = await readFile<Word>(setId)
  const now = new Date()
  const inputWord: Word = { ...word, timeCreate: format(now, 'ddd, MMM DD YYYY HH:mm'), transcription: word.transcription.replace("'", "ˈ") }

  const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`, {
    method: 'GET'
  }).then((res) => res.json())
    .then((result) => {
      return result as Record<string, any>[]
    })
    .catch((err) => {
      console.error("Error:", err)
      return err
    });

  if (!Array.isArray(data)) throw Error(data)

  const listSound = [...new Set(
    data.flatMap((value) => {
      const word_PartOfSpeech = word.partOfSpeech
      const word_Transcription = word.transcription

      const PartOfSpeech = value.meanings.map((pos: Record<string, any>) => pos.partOfSpeech).includes(word_PartOfSpeech)

      if (PartOfSpeech) {
        const Transcription = value.phonetics.filter((tt: Record<string, any>) => tt.text.includes(word_Transcription)).map((tt_data: Record<string, any>) => tt_data.audio.trim()).filter((filterData: string) => filterData)
        return Transcription
      } else {
        return []
      }
    })
  )]

  let newWord: Word

  if (listSound.length != 0) {
    newWord = { ...inputWord, audio: listSound, targetLink: `https://dictionary.cambridge.org/vi/dictionary/english/${word.word}` }
  } else {
    newWord = { ...inputWord, targetLink: `https://dictionary.cambridge.org/vi/dictionary/english/${word.word}` }
  }
  let newListWord = [...oldListWord, newWord]

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
  return await remove(fileName, { baseDir: BaseDirectory.Document });
}

// Delete object in a file
export async function deleteObjectInFile(): Promise<void> {

}


// Get sound
export async function getSound(word: Word): Promise<{ timeoutId: any, callbackFunc: () => void, delay: number }[]> {
  const listWord = word.audio

  if (listWord?.length == 0) throw Error("Sound not found")

  let soudId: { timeoutId: any, callbackFunc: () => void, delay: number }[] = []

  listWord?.forEach((url, index) => {
    const delay = index * 1500
    const callbackFunc = () => {
      const sound = new Audio(url)
      sound.play()
    }
    const timeoutId = setTimeout(callbackFunc, delay)
    clearTimeout(timeoutId)
    soudId.push({ timeoutId, callbackFunc, delay })
  })

  return soudId
}

export async function playSound<T>(listSound: { timeoutId: T, callbackFunc: () => void, delay: number }[]): Promise<ReturnType<typeof setTimeout>[] | []> {
  let listIdForStop: ReturnType<typeof setTimeout>[] = []

  if (listSound.length > 1) {
    TTS(`You have ${listSound.length} sounds`)
    await new Promise(r => setTimeout(r, 3000));
  }

  if (listSound.length == 0) {
    TTS(`No sound found`)
    return []
  }

  listSound.forEach(sound => {
    const sessionPlay = setTimeout(sound.callbackFunc, sound.delay)
    listIdForStop.push(sessionPlay)
  })

  return listIdForStop
}

function TTS(text: string) {
  if (!window.speechSynthesis) {
    console.error("Browsers do not support Web Speech API");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Custom
  utterance.lang = 'en-US';      // Vietnamese
  utterance.rate = 0.8;            // speed (0.1 - 10)
  utterance.pitch = 0.1;           // pitch (0 - 2)

  speechSynthesis.speak(utterance);
}
// Import libraries
import {
    exists,
    BaseDirectory,
} from '@tauri-apps/plugin-fs';

import { join, documentDir } from '@tauri-apps/api/path';

import { format } from 'date-and-time';

// Import type
import { Word, SetStructure } from '../type/DataStructure';

// Import functions
import { readFile } from './readFile';
import { writeFile } from './writeFile';


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
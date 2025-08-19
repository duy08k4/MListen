// Import libraries
import {
  exists,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';

// Import type
import { SetStructure } from '../types/DataStructure';

// Import functions
import { writeFile } from './writeFile';
import { readFile } from './readFile';
import { deleteFile } from './deleteFile';


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
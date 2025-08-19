// Import type
import { Word} from '../types/DataStructure';

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
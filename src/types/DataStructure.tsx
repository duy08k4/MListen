interface Word {
    word: string,
    id: string,
    transcription: string,
    partOfSpeech: string,
    meaning: string	
}

interface SetStructure {
    name: string,
    id: string,
    timeCreate: string
}

export type {
    Word,
    SetStructure
}
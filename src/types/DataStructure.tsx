interface Word {
    word: string,
    id: string,
    transcription: string,
    partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "",
    meaning: string,
    timeCreate?: string
}

interface SetStructure {
    name: string,
    originalName: string,
    id: string,
    timeCreate: string,
    timeUpdate: string
}

export type {
    Word,
    SetStructure
}
export interface Country {
    id: number
    code: string
    name: string
}

export interface City {
    id: number
    name: string
    latitude: number | null
    longitude: number | null
}
export default function getId() {
    return crypto ? crypto.randomUUID() : Math.random() * 1000000000
}

export function loadData(): Array<any> {
    const raw = localStorage.getItem('data')
    if (raw) {
        return JSON.parse(raw)
    } else {
        return []
    }
}

export function saveData(data: Array<any>): void {
    localStorage.setItem('data', JSON.stringify(data))
}

export function saveLayers(data: any): void {
    localStorage.setItem('layers', JSON.stringify(data))
}

export function loadLayers(): any | null {
    const rawData = localStorage.getItem('layers')

    if (rawData) {
        return JSON.parse(rawData)
    } else {
        return null
    }
}

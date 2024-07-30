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

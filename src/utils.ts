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

export function loadLayers(): {
    type: 'FeatureCollection'
    features: any
} | null {
    const rawData = localStorage.getItem('layers')

    try {
        if (rawData) {
            return JSON.parse(rawData)
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}

export class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export function pointInPolygon(point: Point, polygon: Array<Point>) {
    const num_vertices = polygon.length
    const x = point.x
    const y = point.y
    let inside = false

    let p1 = polygon[0]
    let p2

    for (let i = 1; i <= num_vertices; i++) {
        p2 = polygon[i % num_vertices]

        if (y > Math.min(p1.y, p2.y)) {
            if (y <= Math.max(p1.y, p2.y)) {
                if (x <= Math.max(p1.x, p2.x)) {
                    const x_intersection =
                        ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x

                    if (p1.x === p2.x || x <= x_intersection) {
                        inside = !inside
                    }
                }
            }
        }

        p1 = p2
    }

    return inside
}

export function setSearchParams(...values: Array<[string, string]>): void {
    const url = new URL(window.location.href)

    values.forEach(([key, value]) => {
        url.searchParams.set(key, value)
    })

    window.history.replaceState({}, '', url)
}

export function getSearchParams(key: string): string | null {
    const url = new URL(window.location.href)

    return url.searchParams.get(key)
}

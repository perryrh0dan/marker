import { area, polygon } from '@turf/turf'

interface GeoCoordinate {
    latitude: number
    longitude: number
}

// Function to calculate the area of a polygon given its vertices
export function calculatePolygonArea(vertices: GeoCoordinate[]): number {
    const p = polygon([vertices.map((v) => [v.latitude, v.longitude])])

    return area(p) / 10000
}

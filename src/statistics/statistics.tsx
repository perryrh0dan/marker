import { useEffect, useMemo, useState } from 'react'

import './statistics.css'

import { Point, loadData, loadLayers, pointInPolygon } from '../utils'

function Statistics() {
    const [polygons, setPolygons] = useState<
        Array<{ id: string; name: string; markers: number }>
    >([])
    const [selectedPolygonIds, setSelectedPolygonIds] = useState<Array<string>>(
        [],
    )

    useEffect(() => {
        const layers = loadLayers()
        const data = loadData()

        const polygonLayer = layers?.features.filter(
            (m: any) => m.geometry.type === 'Polygon',
        )

        const markers = layers?.features.filter(
            (m: any) => m.geometry.type === 'Point',
        )

        const preparedPolygons = polygonLayer.map((layer: any) => {
            const id = layer.properties.featureId
            const d = data.find((d) => d.id === id)

            const area = layer.geometry.coordinates[0].map(
                ([lat, lng]: [number, number]) => {
                    return new Point(lat, lng)
                },
            )

            let internalCounter = 0
            markers.forEach((element: any) => {
                const point = new Point(
                    element.geometry.coordinates[0],
                    element.geometry.coordinates[1],
                )

                if (pointInPolygon(point, area)) {
                    internalCounter += 1
                }
            })

            return {
                id: id,
                name: d?.name ?? 'Unnamed',
                markers: internalCounter,
            }
        })

        setPolygons(preparedPolygons)
    }, [])

    function handleCheckbox(id: string): void {
        if (selectedPolygonIds.includes(id)) {
            setSelectedPolygonIds(selectedPolygonIds.filter((p) => p !== id))
        } else {
            setSelectedPolygonIds([...selectedPolygonIds, id])
        }
    }

    const totalMarkers = useMemo(() => {
        return polygons
            .filter((p) => selectedPolygonIds.includes(p.id))
            .reduce((acc, val) => acc + val.markers, 0)
    }, [polygons, selectedPolygonIds])

    return (
        <div className="main">
            <span>Total Markers: {totalMarkers}</span>
            <ul>
                {polygons.map((p) => (
                    <li key={p.id} onClick={() => handleCheckbox(p.id)}>
                        <input
                            checked={selectedPolygonIds.includes(p.id)}
                            type="checkbox"
                        />
                        <span>{p.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Statistics

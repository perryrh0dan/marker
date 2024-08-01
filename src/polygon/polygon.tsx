import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import './polygon.css'

import { loadData, loadLayers, saveData, Point, pointInPolygon } from '../utils'
import { calculatePolygonArea } from '../geo'

function Polygon() {
    const params = useParams()
    const navigate = useNavigate()

    const [markerCount, setMarkerCount] = useState<number>(0)
    const [size, setSize] = useState<number>(0)

    const [name, setName] = useState<string>('')
    const [comment, setComment] = useState<string>('')

    useEffect(() => {
        const layers = loadLayers()
        const polygon = layers.features.find(
            (m: any) => m.properties.featureId === params.id,
        )

        if (!polygon) return
        const markers = layers.features.filter(
            (m: any) => m.geometry.type === 'Point',
        )

        const area = polygon.geometry.coordinates[0].map(
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

        setMarkerCount(internalCounter)

        const size = calculatePolygonArea(
            polygon.geometry.coordinates[0].map(
                ([lat, lng]: [number, number]) => {
                    return { latitude: lat, longitude: lng }
                },
            ),
        )

        setSize(Math.round(size * 100) / 100)
    }, [params.id])

    const cancel = () => {
        navigate(-1)
    }

    const handleSave = () => {
        const data = loadData()
        const dataPoint = data.find((m) => m.id === params.id)

        if (dataPoint) {
            dataPoint.name = name
            dataPoint.comment = comment
        } else {
            data.push({ id: params.id, name: name, comment: comment })
        }

        saveData(data)
    }

    const handleCancel = () => {
        cancel()
    }

    const handleNameChange = (e: any) => {
        setName(e.target.value)
    }

    const handleCommentChange = (e: any) => {
        setComment(e.target.value)
    }

    const ration = Math.round((markerCount / size) * 100) / 100

    return (
        <div className="form">
            <div className="infos">
                <span>Markers: {markerCount}</span>
                <span>Size: {size}hr</span>
                <span>Ration: {ration}</span>
            </div>
            <input
                placeholder="Name"
                value={name}
                onChange={handleNameChange}
            />
            <textarea
                rows={10}
                placeholder="Comment"
                value={comment}
                onChange={handleCommentChange}
            />
            <button className="float save" onClick={handleSave}>
                Save
            </button>
            <button className="float cancel" onClick={handleCancel}>
                Cancel
            </button>
        </div>
    )
}

export default Polygon

import { useNavigate, useParams } from 'react-router-dom'

import './marker.css'
import { useEffect, useState } from 'react'

function Marker() {
    const params = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState<string>('')

    const load = (): Array<any> => {
        try {
            const rawData = localStorage.getItem('data')
            if (rawData === null) return []

            return JSON.parse(rawData) ?? []
        } catch (error) {
            return []
        }
    }

    const save = (data: Array<any>) => {
        localStorage.setItem('data', JSON.stringify(data))
    }

    const cancel = () => {
        navigate('/')
    }

    useEffect(() => {
        const markers = load()
        const marker = markers.find((m) => m.id === params.id)

        if (!marker) return

        setTitle(marker.title)
    }, [])

    const handleSave = () => {
        const markers = load()
        const marker = markers.find((m) => m.id === params.id)

        if (marker) {
            marker.title = title
        } else {
            markers.push({ id: params.id, title: title })
        }

        save(markers)
        cancel()
    }

    const handleCancel = () => {
        cancel()
    }

    const handleChange = (e: any) => {
        setTitle(e.target.value)
    }

    return (
        <div className="form">
            <div>{params.id}</div>
            <input value={title} onChange={handleChange} />
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
        </div>
    )
}

export default Marker

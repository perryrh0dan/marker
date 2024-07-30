import { useNavigate, useParams } from 'react-router-dom'

import './marker.css'
import { useEffect, useState } from 'react'
import { loadData, saveData } from '../utils'

function Marker() {
    const params = useParams()
    const navigate = useNavigate()

    const [title, setTitle] = useState<string>('')

    const cancel = () => {
        navigate('/')
    }

    useEffect(() => {
        const markers = loadData()
        const marker = markers.find((m) => m.id === params.id)

        if (!marker) return

        setTitle(marker.title)
    }, [])

    const handleSave = () => {
        const markers = loadData()
        const marker = markers.find((m) => m.id === params.id)

        if (marker) {
            marker.title = title
        } else {
            markers.push({ id: params.id, title: title })
        }

        saveData(markers)
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
            <input placeholder="Title" value={title} onChange={handleChange} />
            <div className="buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
            </div>
        </div>
    )
}

export default Marker

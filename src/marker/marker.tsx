import { useNavigate, useParams } from 'react-router-dom'

import './marker.css'
import { useEffect, useState } from 'react'
import { loadData, saveData } from '../utils'

const BMH = [
    {
        name: 'Spechthöhlen',
    },
    {
        name: 'Mulmhöhlen',
    },
    {
        name: 'Insektengänge und Bohrlöcher',
    },
    {
        name: 'Vertiefungen',
    },
    {
        name: 'Freiliegendes Splintholz',
    },
    {
        name: 'Freiliegendes Splintholz und Kernholz',
    },
    {
        name: 'Fronentotholz',
    },
    {
        name: 'Hexenbsen und Wasserresier',
    },
    {
        name: 'Maserknollen und Krebse',
    },
    {
        name: 'Mehrjährige Pilzfruchtkörper',
    },
    {
        name: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
    },
    {
        name: 'Pflanzen und Flechten, epiphytisch oder prasitisch',
    },
    {
        name: 'Nester',
    },
    {
        name: 'Mikroböden',
    },
    {
        name: 'Saft und Harzflüsse',
    },
]

function Marker() {
    const params = useParams()
    const navigate = useNavigate()

    const [comment, setComment] = useState<string>('')
    const [bmh, setBmh] = useState<Array<string>>([])

    const cancel = () => {
        navigate('/')
    }

    useEffect(() => {
        const markers = loadData()
        const marker = markers.find((m) => m.id === params.id)

        if (!marker) return

        setBmh(marker.bmh ?? [])
        setComment(marker.comment ?? '')
    }, [])

    const handleSave = () => {
        const markers = loadData()
        const marker = markers.find((m) => m.id === params.id)

        if (marker) {
            marker.comment = comment
            marker.bmh = bmh
        } else {
            markers.push({ id: params.id, comment: comment, bmh: bmh })
        }

        saveData(markers)
        cancel()
    }

    const handleCancel = () => {
        cancel()
    }

    const handleChange = (e: any) => {
        setComment(e.target.value)
    }

    const handleTypeChange = (value: string) => {
        setBmh((bmh) => {
            let newBmh = [...bmh]
            if (bmh.includes(value)) {
                newBmh = newBmh.filter((i) => i !== value)
            } else {
                newBmh.push(value)
            }

            return newBmh
        })
    }

    return (
        <div className="form">
            <div className="buttons">
                <button onClick={handleSave}>Save</button>
                <button onClick={handleCancel}>Cancel</button>
            </div>
            <div className="bmhs">
                {BMH.map((value) => (
                    <button
                        className={
                            bmh.includes(value.name) ? 'bmh active' : 'bmh'
                        }
                        onClick={() => handleTypeChange(value.name)}
                    >
                        {value.name}
                    </button>
                ))}
            </div>
            <textarea
                rows={10}
                placeholder="Comment"
                value={comment}
                onChange={handleChange}
            />
        </div>
    )
}

export default Marker

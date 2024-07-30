import { useNavigate, useParams } from 'react-router-dom'

import './marker.css'
import { useEffect, useState } from 'react'
import { loadData, saveData } from '../utils'

const BMH = [
    {
        name: 'Kleine Bruthöhle',
        gruppe: 'Spechthöhlen',
        description: 'Durchmesser < 4cm',
        img: 'Kleine_Bruthoehle.png',
    },
    {
        name: 'Mittelgroße Bruthöhle',
        gruppe: 'Spechthöhlen',
        description: 'Durchmesser < 4-7cm',
        img: 'Mittelgrosse_Bruthoehle.png',
    },
    {
        name: 'Große Bruthöhle',
        gruppe: 'Spechthöhlen',
        description: 'Durchmesser > 10cm',
        img: 'Grosse_Bruthoehle.png',
    },
    {
        name: 'Höhlenetage',
        gruppe: 'Spechthöhlen',
        description: '>= 3 auf einer Linie und Durchmesser > 3cm',
        img: 'Hoehlenetage.png',
    },
    {
        name: 'Mulmhöhle mit Bodenkontakt',
        gruppe: 'Mulmhöhlen',
        description: 'Durchmesser > 10cm',
        img: 'Mulmhoehle_Bodenkontakt.png',
    },
    {
        name: 'Mulmhöhle ohne Bodenkontakt',
        gruppe: 'Mulmhöhlen',
        description: 'Durchmesser > 10cm',
        img: 'Mulmhoehle_Ohne_Bodenkontakt.png',
    },
    {
        name: 'Halboffene Mulmhöhle',
        gruppe: 'Mulmhöhlen',
        description: 'Durchmesser > 30cm',
        img: 'Mulmhoehle_Halboffen.png',
    },
    {
        name: 'Kaminartiger, hohler Stamm',
        gruppe: 'Mulmhöhlen',
        description: 'Durchmesser > 30cm',
        img: 'Hohler_Stamm.png',
    },
    {
        name: 'Asthöhle',
        gruppe: 'Mulmhöhlen',
        description: 'Durchmesser > 10cm',
        img: 'Asthoehle.png',
    },
    {
        name: 'Insektengänge und Bohrlöcher',
        gruppe: 'Insektengänge und Bohrlöcher',
        description: 'Durchmesser > 2cm oder Fläche > 300cm^2',
        img: 'Insektengaenge.png',
    },
    {
        name: 'Vertiefungen',
        img: 'Vertiefung.png',
    },
    {
        name: 'Freiliegendes Splintholz',
        img: 'Freiliegendes_Splitholz.png',
    },
    {
        name: 'Freiliegendes Splintholz und Kernholz',
        img: 'Freiliegendes_Splitholz_Kernholz.png',
    },
    {
        name: 'Kronentotholz',
        img: 'Kronentotholz.png',
    },
    {
        name: 'Hexenbesen',
        gruppe: 'Hexenbesen und Wasserreiser',
        img: 'Hexenbesen.png',
    },
    {
        name: 'Wasserreiser',
        gruppe: 'Hexenbesen und Wasserreiser',
        img: 'Wasserreiser.png',
    },
    {
        name: 'Maserknolle',
        gruppe: 'Maserknollen und Krebse',
        img: 'Maserknolle.png',
    },
    {
        name: 'Krebs',
        gruppe: 'Maserknollen und Krebse',
        img: 'Krebs.png',
    },
    {
        name: 'Mehrjährige Porligne',
        gruppe: 'Mehrjährige Pilzfruchtkörper',
        img: 'Mehrjaehrige_Porlinge.png',
    },
    {
        name: 'Einjährige Porlinge',
        gruppe: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
        img: 'Einjaehrige_Porlinge.png',
    },
    {
        name: 'Ständerpilze',
        gruppe: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
        img: 'Staenderpilze.png',
    },
    {
        name: 'Große Ascomyceten',
        gruppe: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
        img: 'Grosse_Ascomyceten.png',
    },
    {
        name: 'Myxomyceten',
        gruppe: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
        img: 'Myxomyceten.png',
    },
    {
        name: 'Moose oder Lebermoose',
        gruppe: 'Pflanzen und Flechten, epiphytisch oder prasitisch',
        description: '> 10% des Stammes bedeckt',
        img: 'Moose_Lebermoose.png',
    },
    {
        name: 'Blatt- oder Strauchflechten',
        gruppe: 'Pflanzen und Flechten, epiphytisch oder prasitisch',
        description: '> 10% des Stammes bedeckt',
        img: 'Blatt_Strauchflechten.png',
    },
    {
        name: 'Efeu oder Lianen',
        gruppe: 'Pflanzen und Flechten, epiphytisch oder prasitisch',
        description: '> 10% des Stammes bedeckt',
        img: 'Efeu_Lianen.png',
    },
    {
        name: 'Farne',
        gruppe: 'Pflanzen und Flechten, epiphytisch oder prasitisch',
        description: '> 5 Farnwedel',
        img: 'Farne.png',
    },
    {
        name: 'Misteln',
        gruppe: 'Pflanzen und Flechten, epiphytisch oder prasitisch',
        description: '> 20cm',
        img: 'Misteln.png',
    },
    {
        name: 'Nester von Wirbeltieren',
        gruppe: 'Nester',
        img: 'Nester_Wirbeltier.png',
    },
    {
        name: 'Nester von Wirbellosen',
        gruppe: 'Nester',
        img: 'Nester_Wirbellose.png',
    },
    {
        name: 'Mikroboden (Rinde)',
        gruppe: 'Mikroböden',
        img: 'Mikroboden_Rinde.png',
    },
    {
        name: 'Mikroboden (Krone)',
        gruppe: 'Mikroböden',
        img: 'Mikroboden_Krone.png',
    },
    {
        name: 'Aktiver Saftfluss',
        gruppe: 'Saft und Harzflüsse',
        img: 'Aktiver_Saftfluss.png',
    },
    {
        name: 'Aktiver Harzfluss',
        gruppe: 'Saft und Harzflüsse',
        img: 'Aktiver_Harzfluss.png',
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
            <button className="float save" onClick={handleSave}>
                Save
            </button>
            <button className="float cancel" onClick={handleCancel}>
                Cancel
            </button>
            <div className="bmhs">
                {BMH.map((value) => (
                    <button
                        className={
                            bmh.includes(value.name) ? 'bmh active' : 'bmh'
                        }
                        onClick={() => handleTypeChange(value.name)}
                    >
                        <span>{value.name}</span>
                        <img src={`/${value.img}`} />
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

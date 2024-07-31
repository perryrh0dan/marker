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
        name: 'Dendrotelm oder wassergefüllte Baumhöhlung',
        gruppe: 'Vertiefungen',
        description: 'Durchmesser > 15cm',
        img: 'Dendrotelm_Baumhoehlung.png',
    },
    {
        name: 'Frasslöcher',
        gruppe: 'Vertiefungen',
        description: 'Durchmesser > 10cm und Höhe > 10cm',
        img: 'Frassloecher.png',
    },
    {
        name: 'Rindenbedeckte Einbuchtung am Stamm',
        gruppe: 'Vertiefungen',
        description: 'Durchmesser > 10cm und Höhe > 10cm',
        img: 'Rindenbedeckte_Einbuchtung.png',
    },
    {
        name: 'Stammfußhöhle',
        gruppe: 'Vertiefungen',
        description: 'Durchmesser > 10cm und Dachneigung < 45°',
        img: 'Stammfusshoehle.png',
    },
    {
        name: 'Holz ohne Rinde',
        gruppe: 'Freiliegendes Splintholz',
        description: 'Fläche > 300cm^2',
        img: 'Holz_Ohne_Rinde.png',
    },
    {
        name: 'Brandnarbe',
        gruppe: 'Freiliegendes Splintholz',
        description: 'Fläche > 600cm^2',
        img: 'Brandnarbe.png',
    },
    {
        name: 'Rindentasche (unten offen)',
        gruppe: 'Freiliegendes Splintholz',
        description: 'a > 1cm, b > 10cm, c > 10cm',
        img: 'Rindentasche_Unten_Offen.png',
    },
    {
        name: 'Rindentasche (oben offen)',
        gruppe: 'Freiliegendes Splintholz',
        description: 'a > 1cm, b > 10cm, c > 10cm',
        img: 'Rindentasche_Oben_Offen.png',
    },
    {
        name: 'Stammbruch',
        grupp: 'Freiliegendes Splintholz und Kernholz',
        description: 'Durchmesser > 20cm',
        img: 'Stammbruch.png',
    },
    {
        name: 'Starkastbruch mit freiliegendem Kernholz',
        grupp: 'Freiliegendes Splintholz und Kernholz',
        description: 'Fläche > 300cm^2',
        img: 'Starkastbruch.png',
    },
    {
        name: 'Riss, Spalte',
        grupp: 'Freiliegendes Splintholz und Kernholz',
        description: 'Länge > 30cm, Breite > 1cm, Tiefe > 10cm',
        img: 'Riss_Spalte.png',
    },
    {
        name: 'Blitzrinne',
        grupp: 'Freiliegendes Splintholz und Kernholz',
        description: 'Länge > 30cm, Breite > 1cm, Tiefe > 10cm',
        img: 'Blitzrinne.png',
    },
    {
        name: 'Riss bei Zwiesel',
        grupp: 'Freiliegendes Splintholz und Kernholz',
        description: 'Länge > 30cm',
        img: 'Riss_Zwiesel.png',
    },
    {
        name: 'Tote Äste',
        gruppe: 'Kronentotholz',
        description:
            'Durchmesser > 10cm oder Durchmesser > 3cm und 10% Kronentotholz',
        img: 'Tote_Aeste.png',
    },
    {
        name: 'Abgestorbene Kronenspitzen',
        gruppe: 'Kronentotholz',
        description: 'Durchmesser > 10cm an der Basis',
        img: 'Tote_Aeste.png',
    },
    {
        name: 'Abgebrochener Starkast',
        gruppe: 'Kronentotholz',
        description: 'Durchmesser > 20cm, Länge > 50cm',
        img: 'Abgebrochener_Starkast.png',
    },
    {
        name: 'Hexenbesen',
        gruppe: 'Hexenbesen und Wasserreiser',
        description: 'Durchmesser > 50cm',
        img: 'Hexenbesen.png',
    },
    {
        name: 'Wasserreiser',
        gruppe: 'Hexenbesen und Wasserreiser',
        description: '> 5 Zweige',
        img: 'Wasserreiser.png',
    },
    {
        name: 'Maserknolle',
        gruppe: 'Maserknollen und Krebse',
        description: 'Durchmesser > 20cm',
        img: 'Maserknolle.png',
    },
    {
        name: 'Krebs',
        gruppe: 'Maserknollen und Krebse',
        description: 'Durchmesser > 20cm oder großer Teil des Stammes bedeckt',
        img: 'Krebs.png',
    },
    {
        name: 'Mehrjährige Porligne',
        gruppe: 'Mehrjährige Pilzfruchtkörper',
        description: 'Durchmesser > 5cm',
        img: 'Mehrjaehrige_Porlinge.png',
    },
    {
        name: 'Einjährige Porlinge',
        gruppe: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
        description: 'Durchmesser > 5cm oder > 10',
        img: 'Einjaehrige_Porlinge.png',
    },
    {
        name: 'Ständerpilze',
        gruppe: 'Kurzlebige Pilzfruchtkörper und Schleimpilze',
        description: 'Durchmesser > 5cm oder > 10',
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

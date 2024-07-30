import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import {
    Circle,
    FeatureGroup as FeatureGroupLeaflet,
    GeoJSON,
    Icon,
    LatLng,
    Map as MapLeaflet,
    Marker,
} from 'leaflet'
import { useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './map.css'
import getId, { loadData, loadLayers, saveData, saveLayers } from '../utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faDownload,
    faLocationCrosshairs,
    faLocationDot,
    faUpload,
} from '@fortawesome/free-solid-svg-icons'

function Map() {
    const navigate = useNavigate()

    const map = useRef<MapLeaflet | null>(null)
    const fgRef = useRef<FeatureGroupLeaflet | null>(null)
    const liveRef = useRef<FeatureGroupLeaflet | null>(null)

    const currentPositionRef = useRef<GeolocationPosition | null>(null)
    const editingRef = useRef(false)
    const deletingRef = useRef(false)

    const fileUploadRef = useRef<HTMLInputElement | null>(null)

    const updateLiveLocation = (position: GeolocationPosition) => {
        currentPositionRef.current = position

        if (liveRef.current === null) return

        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // clear old layers of feature group
        liveRef.current.getLayers().map((layer) => {
            liveRef.current?.removeLayer(layer)
        })

        const icon = new Icon({
            iconUrl: '/live.png',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        })
        const marker = new Marker([lat, lng], { icon: icon })

        const circle = new Circle([lat, lng], {
            radius: position.coords.accuracy,
        })

        liveRef.current.addLayer(marker)
        liveRef.current.addLayer(circle)
    }

    const handleLocationError = (error: any) => {
        console.error('Error Code = ' + error?.code + ' - ' + error?.message)
    }

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            updateLiveLocation,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            },
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    const fgRefCallback = useCallback((ref: FeatureGroupLeaflet) => {
        if (ref !== null) {
            // clear old layers of feature group
            ref.getLayers().map((layer) => {
                ref.removeLayer(layer)
            })

            try {
                const data = loadLayers()

                const icon = new Icon({
                    iconUrl: '/marker-icon.png',
                    iconSize: [26, 40],
                    iconAnchor: [13, 40],
                })

                const leafletGeoJSON = new GeoJSON(data, {
                    pointToLayer: function (_, latlng) {
                        return new Marker(latlng, { icon: icon })
                    },
                })

                leafletGeoJSON.eachLayer((layer: any) => {
                    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
                    if (layer.feature!!.geometry.type === 'Point') {
                        layer.addEventListener('click', (e: any) =>
                            handleMarkerClick(e),
                        )
                    } else {
                        layer.setStyle({ color: 'blue', opacity: 0.5 })
                    }
                    layer.featureId = layer.feature.properties.featureId
                    ref.addLayer(layer)
                })
            } catch (error) {
                console.log(error)
            }

            fgRef.current = ref
        }
    }, [])

    const handleMarkerClick = (layer: any) => {
        if (!canClick()) return

        navigate(`/marker/${layer.sourceTarget.featureId}`)
    }

    const handleCreated = (e: any): void => {
        const { layerType, layer } = e

        if (!fgRef.current) return

        if (layerType === 'marker') {
            layer.addEventListener('click', (e: any) => handleMarkerClick(e))
        }

        layer.featureId = getId()

        const d = buildGeoJSON()
        saveLayers(d)
    }

    function handleEdited(): void {
        const d = buildGeoJSON()
        saveLayers(d)
    }

    function handleDeleted(): void {
        const d = buildGeoJSON()
        saveLayers(d)
    }

    function buildGeoJSON(): any {
        const d = fgRef.current?.getLayers().map((l: any) => {
            const data = l.toGeoJSON()
            data.properties = {
                ...data.properties,
                ...l.properties,
                featureId: l.featureId,
            }
            return data
        })

        return {
            type: 'FeatureCollection',
            features: d,
        }
    }

    useEffect(() => {
        getCurrentPosition().then((position) => {
            if (map.current) {
                map.current.setView(
                    [position.coords.latitude, position.coords.longitude],
                    13,
                )
            }
        })
    }, [])

    function getCurrentPosition(): Promise<GeolocationPosition> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (error) => reject(error),
            )
        })
    }

    function handleAddMarker(): void {
        const position = currentPositionRef.current

        if (!position) return

        const icon = new Icon({
            iconUrl: '/marker-icon.png',
            iconSize: [26, 40],
            iconAnchor: [13, 40],
        })
        const marker = new Marker(
            [position.coords.latitude, position.coords.longitude],
            { icon: icon },
        ) as any

        marker.addEventListener('click', (e: any) => handleMarkerClick(e))

        // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
        marker.featureId!! = getId()

        fgRef.current?.addLayer(marker)

        const d = buildGeoJSON()
        saveLayers(d)
    }

    function handleJumpToCurrentLocation(): void {
        const position = currentPositionRef.current

        if (!position) return

        const latLng = new LatLng(
            position.coords.latitude,
            position.coords.longitude,
        )
        map.current?.setView(latLng, 18)
    }

    function handleExport(): void {
        const features = buildGeoJSON()
        const data = loadData()

        const result = {
            features: features,
            data: data,
        }

        const url = window.URL.createObjectURL(
            new Blob([JSON.stringify(result)]),
        )
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `layers.json`)

        // Append to html link element page
        document.body.appendChild(link)

        // Start download
        link.click()

        // Clean up and remove the link
        link.parentNode?.removeChild(link)
    }

    function handleImport(): void {
        if (!fileUploadRef.current) return

        fileUploadRef.current.click()
    }

    async function handleFileChange(): Promise<void> {
        if (!fileUploadRef.current) return
        if (!fileUploadRef.current.files) return

        const file = fileUploadRef.current.files[0]
        if (!file) return

        const rawData = await file.text()

        const data = JSON.parse(rawData)

        saveData(data.data)
        saveLayers(data.features)

        window.location.reload()
    }

    function canClick(): boolean {
        return editingRef.current === false && deletingRef.current === false
    }

    return (
        <div className="main">
            <MapContainer
                ref={map}
                className="map"
                center={[37.8189, -122.4786]}
                zoom={13}
                scrollWheelZoom={true}
            >
                <FeatureGroup ref={fgRefCallback}>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        onEdited={handleEdited}
                        onEditStart={() => (editingRef.current = true)}
                        onEditStop={() => (editingRef.current = false)}
                        onDeleted={handleDeleted}
                        onDeleteStart={() => (deletingRef.current = true)}
                        onDeleteStop={() => (deletingRef.current = false)}
                        draw={{
                            rectangle: false,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: true,
                            polygon: {
                                shapeOptions: {
                                    color: 'blue',
                                },
                            },
                        }}
                    />
                </FeatureGroup>
                <FeatureGroup ref={liveRef} />
                <TileLayer
                    maxZoom={18}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
            <button onClick={handleAddMarker} className="float marker">
                <FontAwesomeIcon icon={faLocationDot} />
            </button>
            <button
                onClick={handleJumpToCurrentLocation}
                className="float current"
            >
                <FontAwesomeIcon icon={faLocationCrosshairs} />
            </button>
            <button onClick={handleExport} className="float export">
                <FontAwesomeIcon icon={faDownload} />
            </button>
            <button onClick={handleImport} className="float import">
                <input
                    id="file"
                    ref={fileUploadRef}
                    type="file"
                    onChange={handleFileChange}
                />
                <FontAwesomeIcon icon={faUpload} />
            </button>
        </div>
    )
}

export default Map

import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { GeoJSON, Marker } from 'leaflet'
import { useRef, useCallback, useState, useEffect } from "react";

import './map.css'

function Map() {
  const map = useRef()

  const fgRef = useRef<any>(null)
  const fgRefCallback = useCallback((ref: any) => {
    if (ref !== null) {
      // clear old layers
      Object.values(ref._layers).map(layer => {
        ref.removeLayer(layer)
      })

      // create new layers
      const rawData = localStorage.getItem('data')
      if (rawData) {
        try {
          const data = JSON.parse(rawData)
          const leafletGeoJSON = new GeoJSON(data);

          leafletGeoJSON.eachLayer(layer => {
            layer.addEventListener('click', (e) => console.log(e))
            layer.setStyle({ color: 'blue', opacity: 0.5 })
            ref.addLayer(layer);
          });
        } catch (error) {
          console.log(error)
        }
      }

      fgRef.current = ref
    }
  }, [])

  const handleCreated = (e: any): void => {
    const { layerType, layer } = e;

    if (fgRef.current && layerType === 'polygon') {
      const { _leaflet_id } = layer

      fgRef.current._layers[_leaflet_id].properties = { id: _leaflet_id }

      layer.addEventListener('click', (e) => console.log(e))
    }

    const d = buildGeoJSON()
    save(d)
  }

  function handleEdited(e: any): void {
    const d = buildGeoJSON()
    save(d)
  }

  function handleDeleted(e: any): void {
    const d = buildGeoJSON()
    save(d)
  }

  function buildGeoJSON(): any {
    const d = Object.values(fgRef.current._layers).map((l: any) => {
      const data = l.toGeoJSON()
      data.properties = { ...data.properties, ...l.properties }
      return data
    })

    return {
      type: "FeatureCollection",
      features: d,
    }
  }

  useEffect(() => {
    getCurrentPosition().then(position => {
      if (map.current) {
        map.current.setView([position.coords.latitude, position.coords.longitude], 13)
      }
    })
  }, [])

  function save(data: any): void {
    localStorage.setItem("data", JSON.stringify(data))
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position => resolve(position)), (error) => reject(error))
    })
  }

  async function handleAddMarker(): Promise<void> {
    const position = await getCurrentPosition()
    const marker = new Marker([position.coords.latitude, position.coords.longitude])
    fgRef.current.addLayer(marker)
  }

  return (
    <div className="main">
      <MapContainer ref={map} className='map' center={[37.8189, -122.4786]} zoom={13} scrollWheelZoom={false}>
        <FeatureGroup ref={fgRefCallback}>
          <EditControl position="topright" onCreated={handleCreated} onEdited={handleEdited} onDeleted={handleDeleted} draw={{
            rectangle: false,
            polyline: false,
            circle: false,
            circlemarker: false,
            marker: true,
            polygon: {
              shapeOptions: {
                color: 'blue'
              }
            }
          }} />
        </FeatureGroup>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer >
      <button onClick={handleAddMarker} className="marker">Add Marker</button>
    </div>
  )
}

export default Map

import { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import {
  Circle,
  FeatureGroup as FeatureGroupLeaflet,
  GeoJSON,
  Icon,
  LatLng,
  Map as MapLeaflet,
  Marker,
  MarkerClusterGroup,
  markerClusterGroup,
} from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faDownload,
  faInfo,
  faLocationCrosshairs,
  faLocationDot,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

import './map.css';

import getId, { getSearchParams, loadData, loadLayers, saveData, saveLayers, setSearchParams } from '../utils';

const markerIcon = new Icon({
  iconUrl: '/marker-icon.png',
  iconSize: [26, 40],
  iconAnchor: [13, 40],
});

const liveIcon = new Icon({
  iconUrl: '/live.png',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Map() {
  const navigate = useNavigate();

  const mapRef = useRef<MapLeaflet | null>(null);
  const fgRef = useRef<FeatureGroupLeaflet | null>(null);
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const liveRef = useRef<FeatureGroupLeaflet | null>(null);

  const currentPositionRef = useRef<GeolocationPosition | null>(null);
  const editingRef = useRef(false);
  const deletingRef = useRef(false);

  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  const updateLiveLocation = (position: GeolocationPosition) => {
    currentPositionRef.current = position;

    if (liveRef.current === null) return;

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // clear old layers of feature group
    liveRef.current.eachLayer((layer) => {
      liveRef.current?.removeLayer(layer);
    });

    const marker = new Marker([lat, lng], { icon: liveIcon });

    const circle = new Circle([lat, lng], {
      radius: position.coords.accuracy,
      interactive: false,
    });

    liveRef.current.addLayer(marker);
    liveRef.current.addLayer(circle);
  };

  const handleLocationError = (error: any) => {
    console.error('Error Code = ' + error?.code + ' - ' + error?.message);
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(updateLiveLocation, handleLocationError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleZoomChange = useCallback((e: any) => {
    setSearchParams(['zoom', e.target._zoom]);
  }, []);

  const handleMoveChange = useCallback((e: any) => {
    const center = e.target.getCenter();
    setSearchParams(['lat', center.lat.toString()]);
    setSearchParams(['lng', center.lng.toString()]);
  }, []);

  function copyMarkerToEditableLayer(): void {
    clusterRef.current?.getLayers().map((layer) => {
      if (layer instanceof Marker) {
        const latLng = layer.getLatLng();
        const newMarker = new Marker(latLng, { icon: markerIcon });
        (newMarker as any).featureId = (layer as any).featureId;
        fgRef.current?.addLayer(newMarker);

        clusterRef.current?.removeLayer(layer);
      }
    });
  }

  function copyMarkerFromEditablelayer(): void {
    fgRef.current?.getLayers().map((layer) => {
      if (layer instanceof Marker) {
        const latLng = layer.getLatLng();
        const newMarker = new Marker(latLng, { icon: markerIcon });
        newMarker.addEventListener('click', (e: any) => handleMarkerClick(e));
        (newMarker as any).featureId = (layer as any).featureId;
        clusterRef.current?.addLayer(newMarker);

        fgRef.current?.removeLayer(layer);
      }
    });
  }

  const mapRefCallback = useCallback((ref: MapLeaflet) => {
    if (ref !== null) {
      const lat = getSearchParams('lat');
      const lng = getSearchParams('lng');
      if (lat && lng) {
        const zoom = getSearchParams('zoom');

        ref.setView([parseFloat(lat), parseFloat(lng)], zoom ? parseInt(zoom) : 19);
      } else {
        getCurrentPosition().then((position) => {
          const zoom = getSearchParams('zoom');

          ref.setView([position.coords.latitude, position.coords.longitude], zoom ? parseInt(zoom) : 19);
        });
      }

      ref.on('zoom', handleZoomChange);
      ref.on('moveend', handleMoveChange);

      mapRef.current = ref;

      return () => {
        ref.off('zoom', handleZoomChange);
        ref.off('moveend', handleMoveChange);
      };
    }
  }, []);

  const fgRefCallback = useCallback((ref: FeatureGroupLeaflet) => {
    if (ref !== null) {
      // clear old layers of feature group
      ref.eachLayer((layer) => {
        ref.removeLayer(layer);
      });

      const data = loadLayers();
      if (!data) return;

      const leafletGeoJSON = new GeoJSON(data);

      leafletGeoJSON.eachLayer((layer: any) => {
        // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
        if (layer.feature!!.geometry.type === 'Polygon') {
          layer.setStyle({ color: 'blue', opacity: 0.5 });
          layer.addEventListener('click', (e: any) => handlePolygonClick(e));
          layer.featureId = layer.feature.properties.featureId;
          ref.addLayer(layer);
        }
      });

      fgRef.current = ref;
    }
  }, []);

  const clusterRefCallback = (ref: FeatureGroupLeaflet) => {
    if (ref !== null) {
      // clear old layers of feature group
      ref.eachLayer((layer) => {
        ref.removeLayer(layer);
      });

      const data = loadLayers();
      if (!data) return;

      const leafletGeoJSON = new GeoJSON(data, {
        pointToLayer: function (_, latlng) {
          return new Marker(latlng, { icon: markerIcon });
        },
      });

      const cluster = markerClusterGroup({
        maxClusterRadius: (zoom) => {
          if (zoom > 18) {
            return 10;
          } else if (zoom > 15) {
            return 80;
          } else {
            return 100;
          }
        },
      });

      leafletGeoJSON.eachLayer((layer: any) => {
        // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
        if (layer.feature!!.geometry.type === 'Point') {
          layer.addEventListener('click', (e: any) => handleMarkerClick(e));
          layer.featureId = layer.feature.properties.featureId;
          cluster.addLayer(layer);
        }
      });

      ref.addLayer(cluster);
      clusterRef.current = cluster;
    }
  };

  function handleMarkerClick(layer: any): void {
    if (!canClick()) return;

    navigate(`/marker/${layer.sourceTarget.featureId}`);
  }

  function handlePolygonClick(layer: any): void {
    if (!canClick()) return;

    navigate(`/polygon/${layer.sourceTarget.featureId}`);
  }

  function handleCreated(e: any): void {
    const { layerType, layer } = e;

    if (!fgRef.current) return;

    if (layerType === 'marker') {
      layer.addEventListener('click', (e: any) => handleMarkerClick(e));
      layer.setIcon(markerIcon);
    } else if (layerType === 'polygon') {
      layer.addEventListener('click', (e: any) => handlePolygonClick(e));
    }

    layer.featureId = getId();

    const d = buildGeoJSON();
    saveLayers(d);
  }

  function handleEdited(): void {
    const d = buildGeoJSON();
    saveLayers(d);
  }

  function handleDeleted(e: { layers: FeatureGroupLeaflet }): void {
    const data = loadData();
    const deletedLayerIds = e.layers.getLayers().map((l) => (l as any).featureId);

    const newDate = data.filter((d) => !deletedLayerIds.includes(d.id));
    saveData(newDate);

    const d = buildGeoJSON();
    saveLayers(d);
  }

  function handleEditStart() {
    editingRef.current = true;

    copyMarkerToEditableLayer();
  }

  function handleEditStop() {
    editingRef.current = false;

    copyMarkerFromEditablelayer();
  }

  function handleDeleteStart() {
    deletingRef.current = true;

    copyMarkerToEditableLayer();
  }

  function handleDeleteStop() {
    deletingRef.current = false;

    copyMarkerFromEditablelayer();
  }

  function buildGeoJSON(): any {
    const polygons =
      fgRef.current?.getLayers().map((l: any) => {
        const data = l.toGeoJSON();
        data.properties = {
          ...data.properties,
          ...l.properties,
          featureId: l.featureId,
        };
        return data;
      }) ?? [];

    const markers =
      clusterRef.current?.getLayers().map((l: any) => {
        const data = l.toGeoJSON();
        data.properties = {
          ...data.properties,
          ...l.properties,
          featureId: l.featureId,
        };
        return data;
      }) ?? [];

    return {
      type: 'FeatureCollection',
      features: [...polygons, ...markers],
    };
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    });
  }

  function handleAddMarker(): void {
    const position = currentPositionRef.current;

    if (!position) return;

    const marker = new Marker([position.coords.latitude, position.coords.longitude], { icon: markerIcon }) as any;

    marker.addEventListener('click', (e: any) => handleMarkerClick(e));

    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    marker.featureId!! = getId();

    clusterRef.current?.addLayer(marker);

    const d = buildGeoJSON();
    saveLayers(d);
  }

  function handleJumpToCurrentLocation(): void {
    const position = currentPositionRef.current;

    if (!position) return;

    const latLng = new LatLng(position.coords.latitude, position.coords.longitude);
    mapRef.current?.setView(latLng, 19);
  }

  function handleExport(): void {
    const features = buildGeoJSON();
    const data = loadData();

    const result = {
      features: features,
      data: data,
    };

    const url = window.URL.createObjectURL(new Blob([JSON.stringify(result)]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `layers.json`);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();
  }

  function handleImport(): void {
    if (!fileUploadRef.current) return;

    fileUploadRef.current.click();
  }

  function handleOpenStatistics(): void {
    navigate('/statistics');
  }

  function handleOpenInfo(): void {
    navigate('/info');
  }

  async function handleFileChange(): Promise<void> {
    if (!fileUploadRef.current) return;
    if (!fileUploadRef.current.files) return;

    const file = fileUploadRef.current.files[0];
    if (!file) return;

    const rawData = await file.text();

    const data = JSON.parse(rawData);

    saveData(data.data);
    saveLayers(data.features);

    window.location.reload();
  }

  function canClick(): boolean {
    return editingRef.current === false && deletingRef.current === false;
  }

  return (
    <div className="main">
      <MapContainer
        ref={mapRefCallback}
        className="map"
        center={[37.8189, -122.4786]}
        zoom={19}
        maxZoom={22}
        scrollWheelZoom={true}
      >
        <FeatureGroup ref={fgRefCallback}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onEditStart={handleEditStart}
            onEditStop={handleEditStop}
            onDeleted={handleDeleted}
            onDeleteStart={handleDeleteStart}
            onDeleteStop={handleDeleteStop}
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
        <FeatureGroup ref={clusterRefCallback} />
        <FeatureGroup ref={liveRef} />
        <TileLayer maxZoom={22} maxNativeZoom={19} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
      <button onClick={handleAddMarker} className="float marker">
        <FontAwesomeIcon icon={faLocationDot} />
      </button>
      <button onClick={handleJumpToCurrentLocation} className="float current">
        <FontAwesomeIcon icon={faLocationCrosshairs} />
      </button>
      <button onClick={handleExport} className="float export">
        <FontAwesomeIcon icon={faDownload} />
      </button>
      <button onClick={handleImport} className="float import">
        <input id="file" ref={fileUploadRef} type="file" onChange={handleFileChange} />
        <FontAwesomeIcon icon={faUpload} />
      </button>
      <button onClick={handleOpenStatistics} className="float statistics">
        <FontAwesomeIcon icon={faChartLine} />
      </button>
      <button onClick={handleOpenInfo} className="float info">
        <FontAwesomeIcon icon={faInfo} />
      </button>
    </div>
  );
}

export default Map;

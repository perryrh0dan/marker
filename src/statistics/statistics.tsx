import { useEffect, useMemo, useState } from 'react';

import './statistics.css';

import { BMH } from '../bmh';
import { Point, loadData, loadLayers, pointInPolygon } from '../utils';

function Statistics() {
  const [polygons, setPolygons] = useState<
    Array<{
      id: string;
      name: string;
      markers: number;
      bmhs: Map<number, number>;
    }>
  >([]);
  const [selectedPolygonIds, setSelectedPolygonIds] = useState<Array<string>>([]);

  useEffect(() => {
    const layers = loadLayers();
    const data = loadData();

    const polygonLayer = layers?.features.filter((m: any) => m.geometry.type === 'Polygon');

    const markers = layers?.features.filter((m: any) => m.geometry.type === 'Point');

    const preparedPolygons = polygonLayer.map((layer: any) => {
      const id = layer.properties.featureId;
      const d = data.find((d) => d.id === id);

      const area = layer.geometry.coordinates[0].map(([lat, lng]: [number, number]) => {
        return new Point(lat, lng);
      });

      const bmhs = new Map<number, number>();
      let internalCounter = 0;
      markers.forEach((marker: any) => {
        const id = marker.properties.featureId;
        const dataPoint = data.find((d) => d.id === id);

        const point = new Point(marker.geometry.coordinates[0], marker.geometry.coordinates[1]);

        if (pointInPolygon(point, area)) {
          internalCounter += 1;

          dataPoint?.bmh?.map((v: number) => {
            const value = bmhs.get(v);
            if (value) {
              bmhs.set(v, value + 1);
            } else {
              bmhs.set(v, 1);
            }
          });
        }
      });

      return {
        id: id,
        name: d?.name ?? 'Unnamed',
        markers: internalCounter,
        bmhs: bmhs ?? [],
      };
    });

    setPolygons(preparedPolygons);
    setSelectedPolygonIds(preparedPolygons.map((p: { id: string }) => p.id));
  }, []);

  function handleCheckbox(id: string): void {
    setSelectedPolygonIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  const totalMarkers = useMemo(() => {
    return polygons.filter((p) => selectedPolygonIds.includes(p.id)).reduce((acc, val) => acc + val.markers, 0);
  }, [polygons, selectedPolygonIds]);

  const totalBMHs = useMemo(() => {
    return polygons
      .filter((p) => selectedPolygonIds.includes(p.id))
      .reduce((acc, val) => {
        val.bmhs.forEach((value, key) => {
          const currentValue = acc.get(key);
          if (currentValue) {
            acc.set(key, currentValue + value);
          } else {
            acc.set(key, value);
          }
        });

        return acc;
      }, new Map<number, number>());
  }, [polygons, selectedPolygonIds]);

  return (
    <div className="statistics">
      <h2>Polygons</h2>
      <ul className="polygons">
        {polygons.map((p) => (
          <li key={p.id} onClick={() => handleCheckbox(p.id)}>
            <input defaultChecked={true} checked={selectedPolygonIds.includes(p.id)} type="checkbox" />
            <span>{p.name}</span>
          </li>
        ))}
      </ul>
      <h2>General</h2>
      <span>Total Markers: {totalMarkers}</span>
      <h2>Statistics</h2>
      <ul>
        {Array.from(totalBMHs)
          .sort((a, b) => b[1] - a[1])
          .map(([key, value]) => (
            <li key={key}>
              <span>{BMH.find((v) => v.id === key)?.name}:</span>
              <span>{value}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Statistics;

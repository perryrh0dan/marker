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

    const preparedPolygons = polygonLayer?.map((layer: any) => {
      const id = layer.properties.featureId;
      const d = data.find((d) => d.id === id);

      const area = layer.geometry.coordinates[0].map(([lat, lng]: [number, number]) => {
        return new Point(lat, lng);
      });

      const bmhs = new Map<number, number>();
      let internalCounter = 0;
      markers?.forEach((marker: any) => {
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

  const markersWithMissingData: Array<{ feature: any; details: any | undefined }> = useMemo(() => {
    const layers = loadLayers();
    const data = loadData();

    return layers?.features
      .filter((f: any) => f.geometry.type === 'Point')
      .map((f: any) => {
        const details = data.find((d) => d.id === f.properties.featureId);

        return { feature: f, details };
      })
      .filter((e: any) => {
        const hasBmh = e.details && Array.isArray(e.details.bmh) && e.details.bmh.length > 0;
        return !hasBmh;
      });
  }, []);

  const exportCSV = (): void => {
    const layers = loadLayers();
    const data = loadData();

    const lang = navigator.language;

    // Use comma for English-based locales, semicolon for others
    const separator = lang.startsWith('en') ? ',' : ';';

    const csv: Array<string> = layers?.features
      .filter((f: any) => f.geometry.type === 'Point')
      .map((f: any, i: number) => {
        const details = data.find((d) => d.id === f.properties.featureId);

        const bmhSeparator = separator === ',' ? ';' : ',';
        const bmhs = BMH.filter((b) => details?.bmh?.includes(b.id))
          .map((b) => b.name.replace(',', ''))
          .join(bmhSeparator);

        const coordinates = f.geometry.coordinates;
        const comment = details?.comment ?? '';

        return `${++i}${separator}${bmhs}${separator}${coordinates[1]}${separator}${coordinates[0]}${separator}${comment}`;
      });

    csv.splice(0, 0, `Number${separator}Type${separator}Lat${separator}Lon${separator}Comment`);

    const bom = '\uFEFF';

    const url = window.URL.createObjectURL(new Blob([bom + csv.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `items.csv`);

    document.body.appendChild(link);

    link.click();
  };

  return (
    <div className="statistics">
      <h2>Polygons</h2>
      <ul className="polygons">
        {polygons.map((p) => (
          <li key={p.id} onClick={() => handleCheckbox(p.id)}>
            <input readOnly={false} checked={selectedPolygonIds.includes(p.id)} type="checkbox" />
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
      <h2>More</h2>
      <button onClick={exportCSV}>Export CSV</button>
      <h2>Incomplete data</h2>
      <div className="corrupted">
        <div className="title">Id</div>
        <div className="title">Lat</div>
        <div className="title">Lon</div>
        <div className="title">Comment</div>
        {markersWithMissingData.map((m) => (
          <>
            <a href={`/marker/${m.feature.properties.featureId}`}>{m.feature.properties.featureId}</a>
            <div>{m.feature.geometry.coordinates[1]}</div>
            <div>{m.feature.geometry.coordinates[0]}</div>
            <div>{m.details?.comment ?? '-'}</div>
          </>
        ))}
      </div>
    </div>
  );
}

export default Statistics;

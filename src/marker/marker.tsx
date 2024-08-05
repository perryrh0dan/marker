import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './marker.css';

import { loadData, saveData } from '../utils';
import { BMH } from '../bmh';

function Marker() {
  const params = useParams();
  const navigate = useNavigate();

  const [comment, setComment] = useState<string>('');
  const [bmh, setBmh] = useState<Array<number>>([]);

  const cancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    const markers = loadData();
    const marker = markers.find((m) => m.id === params.id);

    if (!marker) return;

    setBmh(marker.bmh ?? []);
    setComment(marker.comment ?? '');
  }, [params.id]);

  const handleSave = () => {
    const markers = loadData();
    const marker = markers.find((m) => m.id === params.id);

    if (marker) {
      marker.comment = comment;
      marker.bmh = bmh;
    } else {
      markers.push({ id: params.id, comment: comment, bmh: bmh });
    }

    saveData(markers);
    cancel();
  };

  const handleCancel = () => {
    cancel();
  };

  const handleChange = (e: any) => {
    setComment(e.target.value);
  };

  const handleTypeChange = (value: number) => {
    setBmh((bmh) => {
      let newBmh = [...bmh];
      if (bmh.includes(value)) {
        newBmh = newBmh.filter((i) => i !== value);
      } else {
        newBmh.push(value);
      }

      return newBmh;
    });
  };

  return (
    <div className="form">
      <div className="bmhs">
        {BMH.map((value) => (
          <button
            key={value.name}
            className={bmh.includes(value.id) ? 'bmh active' : 'bmh'}
            onClick={() => handleTypeChange(value.id)}
          >
            <span>{value.name}</span>
            <img src={`/${value.img}`} />
          </button>
        ))}
      </div>
      <textarea rows={10} placeholder="Comment" value={comment} onChange={handleChange} />
      <button className="float save" onClick={handleSave}>
        Save
      </button>
      <button className="float cancel" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  );
}

export default Marker;

import './info.css';

import { BMH } from '../bmh';

function Info() {
  return (
    <div className="info">
      <ul>
        {BMH.map((bmh) => (
          <li key={bmh.id}>
            <div>
              <h3>{bmh.name}</h3>
              <div>Form: {bmh.form}</div>
              <div>Gruppe: {bmh.gruppe}</div>
              <div>Beschreibung: {bmh.description}</div>
            </div>
            <img src={`/${bmh.img}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Info;

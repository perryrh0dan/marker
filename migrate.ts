import { readFileSync, writeFileSync } from 'fs';

import { BMH } from './src/bmh';

function main() {
  const data = JSON.parse(readFileSync('layers.json').toString());

  const newData = data.data.map((oldData) => {
    if (oldData.bmh !== undefined) {
      return {
        ...oldData,
        bmh: oldData.bmh?.reduce((acc, cur) => {
          const bmh = BMH.find((v) => v.name === cur);
          if (bmh) {
            acc.push(bmh.id);
          } else {
            console.error(`Unable to map: ${cur}`);
          }

          return acc;
        }, new Array<number>()),
      };
    } else {
      return oldData;
    }
  });

  writeFileSync('layers-v3.json', JSON.stringify({ ...data, version: 3, data: newData }));
}

main();

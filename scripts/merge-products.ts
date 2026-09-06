import * as fs from 'fs';

const file1 = 'd:/Work/source/kupujemprodajem/kp/seleniumkp/fikret.pasovic@live.com.json';
const file2 = 'd:/Work/source/kupujemprodajem/kp/seleniumkp/autici.kupujemprodajem@gmail.com.json';

const data1 = JSON.parse(fs.readFileSync(file1, 'utf-8'));
const data2 = JSON.parse(fs.readFileSync(file2, 'utf-8'));

// Assume data1 and data2 are arrays of objects with title and images
const merged = new Map<string, any>();

function addProducts(products: any[]) {
  for (const product of products) {
    const key = product.title;
    if (!merged.has(key)) {
      merged.set(key, product);
    }
  }
}

addProducts(data1);
addProducts(data2);

const result = Array.from(merged.values());

fs.writeFileSync('merged.json', JSON.stringify(result, null, 2));

console.log('Merged file created: merged.json');
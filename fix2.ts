import * as fs from 'fs';

const files = [
  { path: 'src/pages/CompressPdf.tsx', regex: /toast\.info/g, replacement: 'toast' },
  { path: 'src/pages/ImageToPdf.tsx', regex: /\{ item: FileItem;/g, replacement: '{ item: FileItem; key?: React.Key;' },
  { path: 'src/pages/MergePdf.tsx', regex: /\{ item: FileItem;/g, replacement: '{ item: FileItem; key?: React.Key;' }
];

for (const { path: filePath, regex, replacement } of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, content.replace(regex, replacement), 'utf8');
}

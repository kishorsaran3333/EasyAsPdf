import * as fs from 'fs';
import * as path from 'path';

const files = [
  'src/pages/CompressPdf.tsx',
  'src/pages/ExcelToPdf.tsx',
  'src/pages/ImageToPdf.tsx',
  'src/pages/MergePdf.tsx',
  'src/pages/OcrReader.tsx',
  'src/pages/SplitPdf.tsx',
  'src/pages/WatermarkPdf.tsx'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/const { getRootProps, getInputProps, isDragActive } = useDropzone\(\{((\n|\r|.)*?)\}\);/g, 'const { getRootProps, getInputProps, isDragActive } = useDropzone({$1} as any);');
  
  // Specifically for React-Dropzone in ImageToPdf and MergePdf:
  // "Type '{ key: any; item: any; onRemove: () => void; }' is not assignable to type '{ item: FileItem; onRemove: () => void; }'."
  newContent = newContent.replace(/export default function/g, 'export default function');

  fs.writeFileSync(file, newContent, 'utf8');
}

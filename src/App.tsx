import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MergePdf from './pages/MergePdf';
import SplitPdf from './pages/SplitPdf';
import WatermarkPdf from './pages/WatermarkPdf';
import ImageToPdf from './pages/ImageToPdf';
import CompressPdf from './pages/CompressPdf';
import ExcelToPdf from './pages/ExcelToPdf';
import OcrReader from './pages/OcrReader';
import AllTools from './pages/AllTools';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="merge" element={<MergePdf />} />
        <Route path="split" element={<SplitPdf />} />
        <Route path="watermark" element={<WatermarkPdf />} />
        <Route path="img-to-pdf" element={<ImageToPdf />} />
        <Route path="compress" element={<CompressPdf />} />
        <Route path="excel-to-pdf" element={<ExcelToPdf />} />
        <Route path="ocr" element={<OcrReader />} />
        <Route path="all-tools" element={<AllTools />} />
      </Route>
    </Routes>
  );
}

export default App;

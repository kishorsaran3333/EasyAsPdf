import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Upload, FileDown, ArrowRight, Loader2, File, Scissors } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<'range' | 'custom'>('range');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [customPages, setCustomPages] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const parseCustomPages = (input: string, maxPages: number): number[] => {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    const pages = new Set<number>();
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= maxPages) {
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num >= 1 && num <= maxPages) {
          pages.add(num);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const processFile = async (selected: File) => {
    if (selected.type === 'application/pdf') {
      try {
        const arrayBuffer = await selected.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setFile(selected);
        setPageCount(count);
        setRangeStart(1);
        setRangeEnd(count);
        setCustomPages(`1-${Math.min(3, count)}`);
        setDownloadUrl(null);
      } catch (err) {
        alert('Could not read PDF file. It might be corrupted or encrypted.');
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  } as any);

  const isValidCustom = customPages.trim() !== '' && parseCustomPages(customPages, pageCount).length > 0;
  const isInvalid = splitMode === 'range' 
    ? (rangeStart < 1 || rangeEnd > pageCount || rangeStart > rangeEnd) 
    : !isValidCustom;

  const handleSplit = async () => {
    if (!file || isInvalid) return;
    
    try {
      setIsProcessing(true);
      
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      let indices: number[] = [];
      if (splitMode === 'range') {
        indices = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart - 1 + i);
      } else {
        indices = parseCustomPages(customPages, pageCount).map(n => n - 1);
      }
      
      const copiedPages = await newPdf.copyPages(originalPdf, indices);
      
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert('An error occurred while splitting the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0f172a]">Split PDF</h1>
        <p className="text-[#64748b] mt-2">Extract specific pages from your PDF quickly and securely.</p>
      </div>

      {!downloadUrl ? (
        <div className="flex-1 flex flex-col">
          {!file ? (
            <div 
              {...getRootProps()}
              className={cn(
                "bg-[#f1f5f9] border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group mt-10 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99]",
                isDragActive ? "border-[#3b82f6] bg-[#e2e8f0]" : "border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#e2e8f0]"
              )}
            >
              <input {...getInputProps()} />
              <div className="text-[48px] mb-4 text-[#3b82f6] transition-transform group-hover:scale-110">
                <Scissors size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">
                {isDragActive ? "Drop file here..." : "Select a PDF File"}
              </h2>
              <p className="text-[#64748b] text-[15px] mb-6 max-w-sm">
                Upload your document to select which pages you want to extract. You can also drag and drop it here.
              </p>
              <div className="bg-[#3b82f6] group-hover:bg-blue-600 text-white px-6 py-3 rounded-[10px] font-semibold transition-colors border-none text-[14px]">
                Select PDF file
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="bg-white rounded-[20px] border border-[#e2e8f0] p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <File size={36} className="text-[#3b82f6]" />
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-[#0f172a] truncate">{file.name}</p>
                    <p className="text-sm text-[#64748b]">{pageCount} pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="w-full md:w-auto bg-[#f1f5f9] p-4 rounded-[10px] border border-[#e2e8f0] flex flex-col gap-3">
                  <div className="flex bg-white rounded-[8px] p-1 border border-[#e2e8f0]">
                    <button
                      onClick={() => setSplitMode('range')}
                      className={cn(
                        "flex-1 py-1 px-3 text-xs font-bold rounded-[6px] transition-colors",
                        splitMode === 'range' ? "bg-[#3b82f6] text-white" : "text-[#64748b] hover:text-[#0f172a]"
                      )}
                    >
                      Range
                    </button>
                    <button
                      onClick={() => setSplitMode('custom')}
                      className={cn(
                        "flex-1 py-1 px-3 text-xs font-bold rounded-[6px] transition-colors",
                        splitMode === 'custom' ? "bg-[#3b82f6] text-white" : "text-[#64748b] hover:text-[#0f172a]"
                      )}
                    >
                      Custom
                    </button>
                  </div>
                  
                  {splitMode === 'range' ? (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-[#64748b] mb-1">From</label>
                        <input 
                          type="number" 
                          min={1} 
                          max={rangeEnd} 
                          value={rangeStart || ''} 
                          onChange={(e) => setRangeStart(e.target.value ? Math.max(1, parseInt(e.target.value)) : 1)}
                          onBlur={() => setRangeStart(Math.max(1, Math.min(rangeStart, rangeEnd)))}
                          className="w-24 h-10 px-3 py-2 border border-[#e2e8f0] rounded-[8px] bg-white text-center font-bold text-[14px] text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                        />
                      </div>
                      <span className="text-[#64748b] mt-4 font-bold">-</span>
                      <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-[#64748b] mb-1">To</label>
                        <input 
                          type="number" 
                          min={rangeStart} 
                          max={pageCount} 
                          value={rangeEnd || ''} 
                          onChange={(e) => setRangeEnd(e.target.value ? parseInt(e.target.value) : pageCount)}
                          onBlur={() => setRangeEnd(Math.max(rangeStart, Math.min(rangeEnd, pageCount)))}
                          className="w-24 h-10 px-3 py-2 border border-[#e2e8f0] rounded-[8px] bg-white text-center font-bold text-[14px] text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col min-w-[200px]">
                      <label className="text-[10px] uppercase font-bold text-[#64748b] mb-1">Pages (e.g. 1-3, 5, 8)</label>
                      <input 
                        type="text" 
                        value={customPages} 
                        onChange={(e) => setCustomPages(e.target.value)}
                        placeholder="1, 3-5, 8"
                        className="w-full h-10 px-3 py-2 border border-[#e2e8f0] rounded-[8px] bg-white text-left font-bold text-[14px] text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button 
                  onClick={() => setFile(null)}
                  className="text-[#64748b] hover:text-[#0f172a] font-semibold transition-all px-4 py-2 rounded-[8px] hover:bg-slate-100 active:scale-95"
                >
                  Choose a different file
                </button>
                <button 
                  onClick={handleSplit}
                  disabled={isProcessing || isInvalid}
                  className={cn(
                    "bg-[#3b82f6] text-white px-8 py-3 h-12 rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all border-none mt-6 md:mt-0 focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                    (isProcessing || isInvalid) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:opacity-90 active:scale-[0.98]"
                  )}
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" /> Processing...</>
                  ) : (
                    <>Split PDF <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-[20px] border border-[#e2e8f0] p-12 mt-10">
          <div className="w-24 h-24 bg-[#f1f5f9] text-[#3b82f6] rounded-full flex items-center justify-center mb-6">
            <FileDown size={48} />
          </div>
          <h2 className="text-[28px] font-extrabold text-[#0f172a] mb-4">PDF split successfully!</h2>
          <p className="text-[#64748b] max-w-md mb-8 leading-relaxed">
            Your extracted pages have been packed into a new PDF.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <button 
              onClick={() => { setDownloadUrl(null); setFile(null); }}
              className="px-6 py-3 rounded-[10px] border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold hover:bg-[#f1f5f9] transition-colors order-2 sm:order-1"
            >
              Split another file
            </button>
            <a 
              href={downloadUrl}
              download={`split_pages_${splitMode === 'custom' ? 'custom' : `${rangeStart}-${rangeEnd}`}.pdf`}
              className="px-6 py-3 rounded-[10px] bg-[#3b82f6] text-white font-semibold hover:bg-blue-600 transition-colors shadow-sm flex-1 max-w-[200px] order-1 sm:order-2"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

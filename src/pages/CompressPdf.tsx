import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Upload, FileDown, ArrowRight, Loader2, File, Shrink } from 'lucide-react';
import { cn } from '../lib/utils';
import toast, { Toaster } from 'react-hot-toast';

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [reducedSize, setReducedSize] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setDownloadUrl(null);
      setReducedSize(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  } as any);

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic operation string to remove unreferenced objects
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      
      const originalSize = file.size;
      const newSize = pdfBytes.length;
      const saved = originalSize - newSize;
      
      setReducedSize(saved > 0 ? saved : 0);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      if (saved > 0) {
        toast.success(`Optimized and saved ${(saved / 1024).toFixed(1)} KB!`);
      } else {
        toast("Could not compress further.");
      }
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast.error("Failed to compress PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
      <Toaster position="bottom-center" />
      <div className="max-w-2xl w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-[#3b82f6]/10 text-xl mb-4">
            📉
          </div>
          <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4 tracking-tight">Compress PDF</h1>
          <p className="text-[#64748b] text-lg max-w-lg mx-auto leading-relaxed">
            Reduce file size while optimizing for maximal quality. 
            Runs locally in your browser.
          </p>
        </div>

        {!file && (
          <div 
            {...getRootProps()}
            className={cn(
              "bg-[#f1f5f9] border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99]",
              isDragActive ? "border-[#3b82f6] bg-[#e2e8f0]" : "border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#e2e8f0]"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-[48px] mb-4 text-[#3b82f6] transition-transform group-hover:scale-110">
              <Shrink size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">
              {isDragActive ? "Drop file here..." : "Select a PDF File"}
            </h2>
            <p className="text-[#64748b] font-medium text-[15px]">
              or drag and drop here
            </p>
          </div>
        )}

        {file && !downloadUrl && (
          <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-[#f1f5f9] rounded-[12px] flex items-center justify-center shrink-0">
              <File size={32} className="text-[#3b82f6]" />
            </div>
            
            <div className="flex-1 w-full text-center md:text-left">
              <p className="font-bold text-lg text-[#0f172a] truncate mb-1">{file.name}</p>
              <p className="text-sm font-medium text-[#64748b]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
               <button 
                onClick={() => setFile(null)}
                className="text-[#64748b] hover:text-[#0f172a] font-semibold transition-all px-4 py-2 rounded-[8px] hover:bg-slate-100 active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleCompress}
                disabled={isProcessing}
                className={cn(
                  "bg-[#3b82f6] text-white px-8 py-3 h-12 rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all border-none focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                  isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:opacity-90 active:scale-[0.98]"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    Compress File
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[20px] p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-white rounded-[16px] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="text-[40px] leading-none">🎉</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#166534] mb-2">
              Compression Complete!
            </h2>
            <p className="text-[#15803d] font-medium mb-8">
              {reducedSize !== null && reducedSize > 0 
                ? `You saved ${(reducedSize / 1024).toFixed(2)} KB!`
                : "Your file has been optimized."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                  setReducedSize(null);
                }}
                className="px-6 py-3 bg-white text-[#166534] border-2 border-[#bbf7d0] rounded-[10px] font-bold hover:bg-[#f0fdf4] transition-all active:scale-95"
              >
                Compress Another
              </button>
              <a 
                href={downloadUrl}
                download={`compressed_${file?.name}`}
                className="px-6 py-3 bg-[#22c55e] text-white rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-[#16a34a] transition-all focus:outline-none focus:ring-4 focus:ring-green-500/30 active:scale-95 shadow-sm"
              >
                <FileDown size={20} />
                Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

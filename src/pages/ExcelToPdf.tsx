import React, { useState, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Upload, FileDown, ArrowRight, Loader2, File, Table } from 'lucide-react';
import { cn } from '../lib/utils';
import * as xlsx from 'xlsx';
import toast, { Toaster } from 'react-hot-toast';

export default function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showGridLines, setShowGridLines] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setDownloadUrl(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/csv': ['.csv']
    },
    maxFiles: 1,
  } as any);

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
      
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
        
        let page = pdfDoc.addPage();
        let y = page.getHeight() - 50;
        const startX = 50;
        const cellMargin = 5;

        // Basic auto-width calculation
        const colWidths: number[] = [];
        jsonData.forEach(row => {
          (row || []).forEach((cell, idx) => {
            const text = String(cell != null ? cell : '');
            const width = font.widthOfTextAtSize(text, 10) + (cellMargin * 2);
            colWidths[idx] = Math.max(colWidths[idx] || 50, width);
            // Cap at a reasonable width
            colWidths[idx] = Math.min(colWidths[idx], 200);
          });
        });

        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        // Switch to landscape if table is too wide
        if (totalWidth + startX * 2 > page.getWidth()) {
           page.setSize(Math.max(842, totalWidth + startX * 2), Math.max(595, page.getHeight())); 
           // 842x595 is A4 Landscape
           y = page.getHeight() - 50;
        }

        page.drawText(`Sheet: ${sheetName}`, { x: startX, y, size: 16, font, color: rgb(0, 0, 0) });
        y -= 30;

        for (const row of jsonData) {
          if (y < 50) {
            page = pdfDoc.addPage();
            if (totalWidth + startX * 2 > page.getWidth()) {
              page.setSize(Math.max(842, totalWidth + startX * 2), Math.max(595, page.getHeight())); 
            }
            y = page.getHeight() - 50;
          }
          
          let currentX = startX;
          let rowHeight = 15;
          const isRowEmpty = (row || []).filter(c => c != null && String(c).trim() !== '').length === 0;

          if (!isRowEmpty) {
            (row || []).forEach((cell, idx) => {
              const text = String(cell != null ? cell : '');
              const colWidth = colWidths[idx] || 50;
              
              if (showGridLines) {
                 page.drawRectangle({
                   x: currentX,
                   y: y - 3,
                   width: colWidth,
                   height: rowHeight + 6,
                   borderColor: rgb(0.8, 0.8, 0.8),
                   borderWidth: 1,
                 });
              }

              // Truncate text if needed
              let displayText = text;
              if (font.widthOfTextAtSize(displayText, 10) > colWidth - (cellMargin * 2)) {
                 while (displayText.length > 0 && font.widthOfTextAtSize(displayText + '...', 10) > colWidth - (cellMargin * 2)) {
                   displayText = displayText.slice(0, -1);
                 }
                 displayText += '...';
              }

              page.drawText(displayText, { 
                x: currentX + cellMargin, 
                y: y + 2, 
                size: 10, 
                font, 
                color: rgb(0.2, 0.2, 0.2) 
              });
              
              currentX += colWidth;
            });
            y -= (rowHeight + 6);
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      toast.success('Successfully converted Excel to PDF!');
    } catch (error) {
      console.error('Error converting file:', error);
      toast.error("Failed to convert Excel to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
      <Toaster position="bottom-center" />
      <div className="max-w-2xl w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-[#3b82f6]/10 text-xl mb-4 text-[#3b82f6]">
            <Table size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4 tracking-tight">Excel to PDF</h1>
          <p className="text-[#64748b] text-lg max-w-lg mx-auto leading-relaxed">
            Convert your spreadsheets (.xlsx, .xls, .csv) into clean PDF documents locally in your browser.
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
              <Table size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">
              {isDragActive ? "Drop spreadsheet here..." : "Select Excel File"}
            </h2>
            <p className="text-[#64748b] font-medium text-[15px]">
              Supports .xlsx, .xls, .csv
            </p>
          </div>
        )}

        {file && !downloadUrl && (
          <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
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
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className={cn(
                    "bg-[#3b82f6] text-white px-8 py-3 h-12 rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all border-none focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                    isProcessing ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:opacity-90 active:scale-[0.98]"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      Convert to PDF
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#0f172a] text-sm">Draw Table Grid Lines</p>
                <p className="text-xs text-[#64748b]">Draw lines to separate cells like in Excel.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={showGridLines}
                  onChange={(e) => setShowGridLines(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[20px] p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-white rounded-[16px] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="text-[40px] leading-none">🎉</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#166534] mb-2">
              Conversion Complete!
            </h2>
            <p className="text-[#15803d] font-medium mb-8">
              Your spreadsheet has been converted to PDF.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                }}
                className="px-6 py-3 bg-white text-[#166534] border-2 border-[#bbf7d0] rounded-[10px] font-bold hover:bg-[#f0fdf4] transition-all active:scale-95"
              >
                Convert Another
              </button>
              <a 
                href={downloadUrl}
                download={`converted_${file?.name.replace(/\.[^/.]+$/, "")}.pdf`}
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

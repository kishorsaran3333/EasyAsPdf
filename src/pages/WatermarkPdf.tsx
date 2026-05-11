import React, { useState, useCallback } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Upload, FileDown, ArrowRight, Loader2, File, Type, Stamp, Palette, Move, Maximize, Orbit, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

const COLORS = [
  { name: 'Red', val: rgb(0.8, 0.2, 0.2), hex: '#cc3333' },
  { name: 'Gray', val: rgb(0.5, 0.5, 0.5), hex: '#808080' },
  { name: 'Black', val: rgb(0.1, 0.1, 0.1), hex: '#1a1a1a' },
  { name: 'Blue', val: rgb(0.2, 0.4, 0.8), hex: '#3366cc' },
];

const POSITIONS = ['Center', 'Top Left', 'Top Right', 'Bottom Left', 'Bottom Right', 'Tiled Mode (Secure)'];
const FONTS = ['Helvetica', 'Times Roman', 'Courier'];

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  // Advanced settings
  const [opacity, setOpacity] = useState(30);
  const [size, setSize] = useState(70);
  const [colorIdx, setColorIdx] = useState(0);
  const [rotation, setRotation] = useState(45);
  const [positionIdx, setPositionIdx] = useState(0);
  const [fontIdx, setFontIdx] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles[0].type === 'application/pdf') {
        setFile(acceptedFiles[0]);
        setDownloadUrl(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  } as any);

  const handleWatermark = async () => {
    if (!file || !watermarkText) return;
    
    try {
      setIsProcessing(true);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      let selectedFont = StandardFonts.HelveticaBold;
      if (FONTS[fontIdx] === 'Times Roman') selectedFont = StandardFonts.TimesRomanBold;
      if (FONTS[fontIdx] === 'Courier') selectedFont = StandardFonts.CourierBold;
      
      const font = await pdfDoc.embedFont(selectedFont);
      const textWidth = font.widthOfTextAtSize(watermarkText, size);
      
      const pages = pdfDoc.getPages();
      
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        let x = 0;
        let y = 0;

        // Origin defaults
        const textHeightOffset = size / 2;
        const textWidthOffset = (textWidth / 2) * Math.cos((rotation * Math.PI) / 180);
        const yRotOffset = (textWidth / 2) * Math.sin((rotation * Math.PI) / 180);

        if (positionIdx === 5) {
          // Tiled
          const xStep = textWidth + Math.max(textWidth * 0.5, 50);
          const yStep = size * 3;
          for (let tx = -width; tx < width * 2; tx += xStep) {
            for (let ty = -height; ty < height * 2; ty += yStep) {
              const rotatedX = tx * Math.cos(rotation * Math.PI / 180) - ty * Math.sin(rotation * Math.PI / 180);
              const rotatedY = tx * Math.sin(rotation * Math.PI / 180) + ty * Math.cos(rotation * Math.PI / 180);
              page.drawText(watermarkText, {
                x: rotatedX + width / 2,
                y: rotatedY + height / 2,
                size: size,
                font: font,
                color: COLORS[colorIdx].val,
                opacity: opacity / 100,
                rotate: degrees(rotation),
              });
            }
          }
        } else {
          switch (positionIdx) {
            case 0: // Center
              x = width / 2 - textWidthOffset;
              y = height / 2 - textHeightOffset - yRotOffset;
              break;
            case 1: // Top Left
              x = 50;
              y = height - 50 - yRotOffset;
              break;
            case 2: // Top Right
              x = width - textWidth - 50;
              y = height - 50 - textHeightOffset;
              break;
            case 3: // Bottom Left
              x = 50 + yRotOffset;
              y = 50 + textHeightOffset;
              break;
            case 4: // Bottom Right
              x = width - textWidth - 50;
              y = 50 + textHeightOffset;
              break;
          }
          
          page.drawText(watermarkText, {
            x,
            y,
            size: size,
            font: font,
            color: COLORS[colorIdx].val,
            opacity: opacity / 100,
            rotate: degrees(rotation),
          });
        }
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert('An error occurred while adding the watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0f172a]">Add Watermark</h1>
        <p className="text-[#64748b] mt-2">Stamp text over your PDF pages to protect your work or indicate status.</p>
      </div>

      {!downloadUrl ? (
        <div className="flex-1 flex flex-col">
          {!file ? (
            <div 
              {...getRootProps()}
              className={cn(
                "border-none rounded-[20px] p-12 flex flex-col items-center justify-center text-center transition-all mt-10 cursor-pointer group focus:outline-none focus:ring-4 focus:ring-slate-800/50 active:scale-[0.99]",
                isDragActive ? "bg-slate-800" : "bg-[#0f172a] hover:bg-slate-800"
              )}
            >
              <input {...getInputProps()} />
              <div className="text-[48px] mb-4 text-white transition-transform group-hover:scale-110">
                <Stamp size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                {isDragActive ? "Drop file here..." : "Select a PDF File"}
              </h2>
              <p className="text-white/60 text-[15px] mb-6 max-w-sm">
                Upload your document to apply a text watermark to all pages securely. You can also drag and drop it here.
              </p>
              <div className="bg-white text-[#0f172a] px-6 py-3 rounded-[10px] font-bold transition-colors border-none text-[14px] group-hover:bg-slate-100">
                Select PDF file
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="bg-white rounded-[20px] border border-[#e2e8f0] p-6 flex flex-col gap-6">
                
                <div className="flex items-center gap-4 p-4 border border-[#e2e8f0] rounded-[10px] bg-[#f1f5f9]">
                  <File size={32} className="text-[#0f172a] shrink-0" />
                  <div className="min-w-0 flex-1 flex justify-between items-center">
                    <p className="font-bold text-[#0f172a] truncate">{file.name}</p>
                    <button onClick={() => setFile(null)} className="text-sm font-semibold text-[#64748b] hover:text-red-500 transition-colors">Remove</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#0f172a] mb-2 flex items-center gap-2">
                    <Type size={16} className="text-[#0f172a]" />
                    Watermark Text
                  </label>
                  <input 
                    type="text" 
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="E.g., CONFIDENTIAL, DRAFT, DO NOT COPY"
                    className="w-full px-4 h-14 border border-[#e2e8f0] rounded-[10px] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all font-bold text-lg text-[#0f172a]"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-[#64748b]">
                      Default: Diagonally centered, semitransparent red.
                    </p>
                    <button 
                      onClick={() => setShowAdvanced(!showAdvanced)} 
                      className="text-xs font-bold text-[#3b82f6] flex items-center gap-1 hover:underline"
                    >
                      <SlidersHorizontal size={14} />
                      {showAdvanced ? "Hide settings" : "Advanced settings"}
                    </button>
                  </div>
                </div>

                {showAdvanced && (
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                    <div>
                       <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-1"><Palette size={14} /> Color</label>
                       <div className="flex gap-2">
                         {COLORS.map((c, i) => (
                           <button 
                             key={c.name}
                             onClick={() => setColorIdx(i)}
                             className={cn("w-8 h-8 rounded-full border-2 transition-transform active:scale-90", colorIdx === i ? "border-slate-800 scale-110" : "border-transparent")}
                             style={{ backgroundColor: c.hex }}
                             title={c.name}
                           />
                         ))}
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center gap-1"><Move size={14} /> Position</label>
                       <select 
                         value={positionIdx} 
                         onChange={(e) => setPositionIdx(Number(e.target.value))}
                         className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-3 py-2 text-sm font-semibold text-[#0f172a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none"
                       >
                         {POSITIONS.map((p, i) => <option key={i} value={i}>{p}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center justify-between">
                         <span className="flex items-center gap-1"><Maximize size={14} /> Size</span>
                         <span>{size}pt</span>
                       </label>
                       <input 
                         type="range" min={20} max={150} value={size} 
                         onChange={(e) => setSize(Number(e.target.value))} 
                         className="w-full accent-[#3b82f6]"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center justify-between">
                         <span className="flex items-center gap-1"><Orbit size={14} /> Rotation</span>
                         <span>{rotation}°</span>
                       </label>
                       <input 
                         type="range" min={-90} max={90} value={rotation} 
                         onChange={(e) => setRotation(Number(e.target.value))} 
                         className="w-full accent-[#3b82f6]"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2 flex items-center justify-between">
                         <span className="flex items-center gap-1">Opacity</span>
                         <span>{opacity}%</span>
                       </label>
                       <input 
                         type="range" min={5} max={100} value={opacity} 
                         onChange={(e) => setOpacity(Number(e.target.value))} 
                         className="w-full accent-[#3b82f6]"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">Font</label>
                       <select 
                         value={fontIdx} 
                         onChange={(e) => setFontIdx(Number(e.target.value))}
                         className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-3 py-2 text-sm font-semibold text-[#0f172a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] outline-none"
                       >
                         {FONTS.map((f, i) => <option key={i} value={i}>{f}</option>)}
                       </select>
                    </div>
                  </div>
                )}

              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleWatermark}
                  disabled={isProcessing || !watermarkText.trim()}
                  className={cn(
                    "bg-[#0f172a] text-white px-8 h-12 rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all border-none mt-6 md:mt-0 focus:outline-none focus:ring-4 focus:ring-slate-800/30",
                    (isProcessing || !watermarkText.trim()) ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800 active:scale-[0.98]"
                  )}
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" /> Processing...</>
                  ) : (
                    <>Add Watermark <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#0f172a] rounded-[20px] p-12 mt-10">
          <div className="w-24 h-24 bg-white/10 text-white rounded-full flex items-center justify-center mb-6">
            <FileDown size={48} />
          </div>
          <h2 className="text-[28px] font-extrabold text-white mb-4">Watermark added!</h2>
          <p className="text-white/60 max-w-md mb-8">
            Your document has been securely watermarked in your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <button 
              onClick={() => { setDownloadUrl(null); setFile(null); }}
              className="px-6 py-3 rounded-[10px] outline outline-1 outline-white/20 bg-transparent text-white font-bold hover:bg-white/10 transition-colors order-2 sm:order-1"
            >
              Process another file
            </button>
            <a 
              href={downloadUrl}
              download={`watermarked_${file?.name || 'document.pdf'}`}
              className="px-6 py-3 rounded-[10px] bg-white text-[#0f172a] font-bold hover:bg-slate-100 transition-colors shadow-sm flex-1 max-w-[200px] order-1 sm:order-2"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

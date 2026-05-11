import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, FileText, ScanText, ArrowRight, Copy, Check, Globe, SlidersHorizontal, Sliders, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import Tesseract from 'tesseract.js';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'rus', name: 'Russian' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'chi_tra', name: 'Chinese (Traditional)' },
];

const PSM_MODES = [
  { value: 3, label: 'Auto (Default)' },
  { value: 1, label: 'Automatic with OSD' },
  { value: 4, label: 'Single Column (Variable sizes)' },
  { value: 6, label: 'Uniform Block of Text' },
  { value: 11, label: 'Sparse Text (Find as much as possible)' }
];

export default function OcrReader() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Advanced Settings
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['eng']);
  const [psm, setPsm] = useState<number>(3);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'standard' | 'gemini'>('gemini');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
      setProcessedPreview(url);
      setExtractedText('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'image/png': ['.png'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/bmp': ['.bmp'],
        'image/webp': ['.webp']
    },
    maxFiles: 1,
  } as any);

  const [applyAdaptiveThresh, setApplyAdaptiveThresh] = useState(false);
  const [applyNoiseReduction, setApplyNoiseReduction] = useState(false);
  const [applyDeskew, setApplyDeskew] = useState(false);

  useEffect(() => {
    if (!preview || !canvasRef.current) return;
    
    // Process image for preview when contrast or grayscale changes or OpenCV features
    if (contrast === 100 && !grayscale && !applyAdaptiveThresh && !applyNoiseReduction && !applyDeskew) {
      setProcessedPreview(preview);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (applyAdaptiveThresh || applyNoiseReduction || applyDeskew) {
        const cv = (window as any).cv;
        if (!cv || !cv.Mat) {
           // Fallback if OpenCV isn't loaded yet
           ctx.filter = `contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;
           ctx.drawImage(img, 0, 0);
           setProcessedPreview(canvas.toDataURL('image/jpeg', 0.9));
           toast.error("OpenCV is still loading, basic fallback used.", { id: 'cv-loading' });
           return;
        }

        try {
          ctx.drawImage(img, 0, 0);
          let src = cv.imread(canvas);
          let dst = new cv.Mat();

          // 1. Grayscale (Adaptive Thresholding and OpenCV ops work best on grayscale)
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

          // 2. Noise Reduction
          if (applyNoiseReduction) {
            cv.GaussianBlur(dst, dst, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
          }

          // 3. Adaptive Thresholding
          if (applyAdaptiveThresh) {
            cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
          }

          // 4. Deskewing (safe simple implementation)
          if (applyDeskew) {
            let m = new cv.Mat();
            cv.bitwise_not(dst, m);
            let coords = new cv.Mat();
            cv.findNonZero(m, coords);
            
            if (coords.rows > 0) {
              let box = cv.minAreaRect(coords);
              let angle = box.angle;
              if (angle < -45) {
                angle = -(90 + angle);
              } else {
                angle = -angle;
              }
              if (Math.abs(angle) > 0.5 && Math.abs(angle) < 45) {
                let M = cv.getRotationMatrix2D(new cv.Point(src.cols/2, src.rows/2), angle, 1);
                cv.warpAffine(dst, dst, M, new cv.Size(src.cols, src.rows), cv.INTER_CUBIC, new cv.Scalar(255, 255, 255, 255));
                M.delete();
              }
            }
            m.delete();
            coords.delete();
          }

          cv.imshow(canvas, dst);
          src.delete();
          dst.delete();
        } catch (err) {
          console.error("OpenCV processing error:", err);
          // Fallback
          ctx.filter = `contrast(${contrast}%) ${grayscale ? 'grayscale(100%)' : ''}`;
          ctx.drawImage(img, 0, 0);
        }
      } else {
        // Standard canvas filter fallback
        let filter = `contrast(${contrast}%)`;
        if (grayscale) {
          filter += ` grayscale(100%)`;
        }
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0);
      }
      
      setProcessedPreview(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = preview;
  }, [preview, contrast, grayscale, applyAdaptiveThresh, applyNoiseReduction, applyDeskew]);

  const toggleLanguage = (code: string) => {
    if (selectedLangs.includes(code)) {
      if (selectedLangs.length === 1) return; // Need at least one
      setSelectedLangs(selectedLangs.filter(l => l !== code));
    } else {
      setSelectedLangs([...selectedLangs, code]);
    }
  };

  const handleScan = async () => {
    if (!processedPreview) return;

    setIsProcessing(true);
    setExtractedText('');
    try {
      if (scanMode === 'gemini') {
        toast.loading(`Analyzing image with Gemini Smart Scan...`, { id: 'ocr' });
        
        let base64Data = '';
        let mimeType = 'image/jpeg';
        
        if (processedPreview && processedPreview.startsWith('data:')) {
           const match = processedPreview.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
           if (match) {
               mimeType = match[1];
           }
           base64Data = processedPreview.split(',')[1];
        } else if (image) {
           mimeType = image.type || 'image/jpeg';
           base64Data = await new Promise<string>((resolve, reject) => {
             const reader = new FileReader();
             reader.readAsDataURL(image);
             reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
             };
             reader.onerror = reject;
           });
        }
        
        if (!base64Data) {
            throw new Error("Could not process image data for upload.");
        }

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: {
              parts: [
                {
                  text: "You are an expert OCR system. Extract ALL the text from this image exactly as it appears. Preserve the formatting, line breaks, spacing, and numbers accurately. If there are tables or lists, structure them as text cleanly. Do not provide any conversational summary or extra text. ONLY return the extracted text from the image."
                },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                  }
                }
              ]
            }
          });

          setExtractedText(response.text || "");
          toast.success("Text extracted successfully with AI!", { id: 'ocr' });
        } catch (e: any) {
          console.error("Gemini AI API Error:", e);
          toast.error(`Gemini Error: ${e.message || 'Unknown error'}`, { id: 'ocr' });
          setIsProcessing(false);
          return;
        }
      } else {
        const langString = selectedLangs.join('+');
        toast.loading(`Scanning image using ${langString}... this might take a minute depending on language files.`, { id: 'ocr' });
        
        const worker = await Tesseract.createWorker(langString, 1, {});
        
        await worker.setParameters({
          tessedit_pageseg_mode: psm as Tesseract.PSM,
        });
        
        const { data: { text } } = await worker.recognize(processedPreview);
        await worker.terminate();

        setExtractedText(text);
        toast.success("Text extracted successfully!", { id: 'ocr' });
      }
    } catch (error) {
      console.error('Error scanning image:', error);
      toast.error("Failed to extract text. Make sure you are using a good quality image.", { id: 'ocr' });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
      <Toaster position="bottom-center" />
      <div className="max-w-4xl w-full">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-[#3b82f6]/10 text-xl mb-4 text-[#3b82f6]">
            <ScanText size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4 tracking-tight">OCR Reader</h1>
          <p className="text-[#64748b] text-lg max-w-lg mx-auto leading-relaxed">
            Extract text from scanned images using optical character recognition in your browser.
          </p>
        </div>

        {!image && (
          <div 
            {...getRootProps()}
            className={cn(
              "bg-[#f1f5f9] border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99] max-w-2xl mx-auto",
              isDragActive ? "border-[#3b82f6] bg-[#e2e8f0]" : "border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#e2e8f0]"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-[48px] mb-4 text-[#3b82f6] transition-transform group-hover:scale-110">
              <ScanText size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">
              {isDragActive ? "Drop image here..." : "Select an Image"}
            </h2>
            <p className="text-[#64748b] font-medium text-[15px]">
              JPG, PNG, WEBP, BMP
            </p>
          </div>
        )}

        {image && !extractedText && (
          <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 lg:p-10 shadow-sm flex flex-col items-center gap-8 max-w-4xl mx-auto">
            <canvas ref={canvasRef} className="hidden" />
            <div className="w-full grid md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div className="w-full bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
                  <img src={processedPreview!} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-[#0f172a] truncate mb-1">{image.name}</p>
                  <p className="text-sm font-medium text-[#64748b]">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-5">
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-[#0f172a] text-lg">Scan Mode</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setScanMode('gemini')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold flex-1 text-left",
                        scanMode === 'gemini' 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <Sparkles className={scanMode === 'gemini' ? "text-blue-500" : "text-slate-400"} size={20} />
                      <div>
                        <div className="text-sm">Smart AI Scan</div>
                        <div className={cn("text-xs font-normal", scanMode === 'gemini' ? "text-blue-600/80" : "text-slate-400")}>Highest accuracy & layout preserving</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setScanMode('standard')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold flex-1 text-left",
                        scanMode === 'standard' 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <ScanText className={scanMode === 'standard' ? "text-blue-500" : "text-slate-400"} size={20} />
                      <div>
                        <div className="text-sm">Standard (Local)</div>
                        <div className={cn("text-xs font-normal", scanMode === 'standard' ? "text-blue-600/80" : "text-slate-400")}>Faster, works offline</div>
                      </div>
                    </button>
                  </div>
                </div>

                {scanMode === 'standard' && (
                  <div className="flex flex-col gap-2 mt-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#0f172a]">
                        <Globe size={16} className="text-[#64748b]" /> Languages
                      </label>
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)} 
                        className="text-xs font-bold text-[#3b82f6] flex items-center gap-1 hover:underline"
                      >
                        <SlidersHorizontal size={14} />
                        {showAdvanced ? "Basic" : "Advanced"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => toggleLanguage(lang.code)}
                          className={cn(
                            "px-2 py-1.5 text-xs font-semibold border rounded-md transition-colors",
                            selectedLangs.includes(lang.code) 
                              ? "bg-blue-500 text-white border-blue-500" 
                              : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                          )}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Select multiple languages for mixed text (e.g., English & Hindi).</p>
                  </div>
                )}
                
                {scanMode === 'standard' && showAdvanced && (
                  <div className="flex flex-col gap-5 pt-4 border-t border-slate-200 mt-2 animate-in fade-in duration-200">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-[#64748b] uppercase">Page Segmentation Mode</label>
                      <select 
                        value={psm}
                        onChange={(e) => setPsm(Number(e.target.value))}
                        className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-3 py-2 text-sm font-semibold text-[#0f172a] focus:border-[#3b82f6] outline-none"
                      >
                        {PSM_MODES.map(mode => (
                          <option key={mode.value} value={mode.value}>{mode.label}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-500">How Tesseract interprets the layout. Change this if text blocks are combined incorrectly or missed.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-xs font-bold text-[#64748b] uppercase">Image Enhancements</label>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold">Contrast</span>
                          <span className="text-slate-500">{contrast}%</span>
                        </div>
                        <input 
                          type="range" min={50} max={200} value={contrast} 
                          onChange={(e) => setContrast(Number(e.target.value))} 
                          className="w-full accent-[#3b82f6]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={grayscale} 
                            onChange={(e) => setGrayscale(e.target.checked)}
                            className="accent-blue-500 w-4 h-4 rounded"
                          />
                           Grayscale Mode
                        </label>

                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={applyAdaptiveThresh} 
                            onChange={(e) => setApplyAdaptiveThresh(e.target.checked)}
                            className="accent-blue-500 w-4 h-4 rounded"
                          />
                           Adaptive Thresholding
                        </label>
                        
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={applyNoiseReduction} 
                            onChange={(e) => setApplyNoiseReduction(e.target.checked)}
                            className="accent-blue-500 w-4 h-4 rounded"
                          />
                           Noise Reduction
                        </label>

                         <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={applyDeskew} 
                            onChange={(e) => setApplyDeskew(e.target.checked)}
                            className="accent-blue-500 w-4 h-4 rounded"
                          />
                           Auto-Deskew
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row w-full justify-center gap-4">
               <button 
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                  setProcessedPreview(null);
                }}
                disabled={isProcessing}
                className="text-[#64748b] hover:text-[#0f172a] font-semibold transition-all px-8 py-3 rounded-[10px] hover:bg-slate-100 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleScan}
                disabled={isProcessing || (scanMode === 'standard' && selectedLangs.length === 0)}
                className={cn(
                  "bg-[#3b82f6] text-white px-10 py-3 h-14 rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-3 transition-all border-none focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                  (isProcessing || (scanMode === 'standard' && selectedLangs.length === 0)) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:opacity-90 active:scale-[0.98]"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Scanning Image...
                  </>
                ) : (
                  <>
                    Extract Text
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {extractedText && (
          <div className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 lg:p-10 shadow-sm animate-in fade-in duration-300">
             <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
                        <FileText className="text-[#3b82f6]" />
                        Extracted Text
                     </h3>
                     <button
                       onClick={copyToClipboard}
                       className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-semibold transition-colors"
                     >
                       {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                       {copied ? "Copied" : "Copy"}
                     </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[200px] max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-800">
                     {extractedText}
                  </div>
                </div>

                <div className="lg:w-1/3 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-[#0f172a]">Original Image</h3>
                  <div className="bg-slate-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                     <img src={preview!} alt="Scanned" className="w-full h-auto object-contain rounded-lg" />
                  </div>
                  <button 
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                      setProcessedPreview(null);
                      setExtractedText('');
                    }}
                    className="mt-auto px-6 py-3 w-full bg-[#f1f5f9] text-[#0f172a] rounded-[10px] font-bold hover:bg-[#e2e8f0] transition-all active:scale-95"
                  >
                    Scan Another Image
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

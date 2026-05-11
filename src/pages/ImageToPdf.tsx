import React, { useState, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileDown, ArrowRight, Loader2, Image as ImageIcon, ImagePlus, GripHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
}

function SortableImageItem({ item, onRemove }: { item: FileItem; key?: React.Key; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-white border rounded-[20px] p-2 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden transition-colors",
        isDragging ? "shadow-xl border-blue-500 bg-blue-50/50 scale-105" : "border-[#e2e8f0] hover:border-[#3b82f6]"
      )}
    >
      <div className="absolute inset-0 z-0">
        <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-white/60 group-hover:bg-transparent transition-colors pointer-events-none" />
      </div>
      
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 p-1.5 cursor-grab active:cursor-grabbing text-slate-700 bg-white/80 rounded-md backdrop-blur-sm shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
        title="Drag to reorder"
      >
        <GripHorizontal size={16} />
      </div>

      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 w-7 h-7 bg-white/80 text-red-600 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm active:scale-90 z-10 backdrop-blur-sm"
      >
        <X size={14} strokeWidth={2.5} />
      </button>

      <div className="z-10 bg-white/80 backdrop-blur-md w-[90%] px-2 py-1 rounded-lg mt-auto shadow-sm">
        <p className="text-[11px] text-center text-[#0f172a] font-bold truncate">
          {item.file.name}
        </p>
      </div>
    </div>
  );
}

export default function ImageToPdf() {
  const [images, setImages] = useState<FileItem[]>([]);
  const [formatMode, setFormatMode] = useState<'fit' | 'a4-portrait' | 'a4-landscape'>('fit');
  const [marginMode, setMarginMode] = useState<'none' | 'small' | 'large'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFiles = acceptedFiles
      .filter(f => 
        f.type === 'image/jpeg' || 
        f.type === 'image/jpg' || 
        f.type === 'image/png'
      )
      .map(file => ({ 
        id: `${file.name}-${Date.now()}-${Math.random()}`, 
        file,
        previewUrl: URL.createObjectURL(file)
      }));
    setImages(prev => [...prev, ...selectedFiles]);
    setDownloadUrl(null);
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      images.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png']
    }
  } as any);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(f => f.id !== id));
  };

  const clearAllImages = () => {
    setImages([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      const pdfDoc = await PDFDocument.create();
      
      for (const item of images) {
        const arrayBuffer = await item.file.arrayBuffer();
        let pdfImage;
        
        if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (item.file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue;
        }

        const imgDims = pdfImage.scale(1);
        
        let pageWidth = imgDims.width;
        let pageHeight = imgDims.height;
        
        if (formatMode === 'a4-portrait') {
          pageWidth = 595.28;
          pageHeight = 841.89;
        } else if (formatMode === 'a4-landscape') {
          pageWidth = 841.89;
          pageHeight = 595.28;
        }
        
        let padX = 0;
        let padY = 0;
        if (marginMode === 'small') { padX = 20; padY = 20; }
        if (marginMode === 'large') { padX = 50; padY = 50; }
        
        const usableWidth = pageWidth - (padX * 2);
        const usableHeight = pageHeight - (padY * 2);
        
        const scaleToFitWidth = usableWidth / imgDims.width;
        const scaleToFitHeight = usableHeight / imgDims.height;
        let finalScale = Math.min(scaleToFitWidth, scaleToFitHeight);
        
        if (formatMode === 'fit') {
          pageWidth = (imgDims.width * finalScale) + (padX * 2);
          pageHeight = (imgDims.height * finalScale) + (padY * 2);
        }
        
        const finalImgWidth = imgDims.width * finalScale;
        const finalImgHeight = imgDims.height * finalScale;
        
        const xOffset = (pageWidth - finalImgWidth) / 2;
        const yOffset = (pageHeight - finalImgHeight) / 2;
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        page.drawImage(pdfImage, {
          x: xOffset,
          y: yOffset,
          width: finalImgWidth,
          height: finalImgHeight,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert('An error occurred while converting images. Please ensure they are valid JPG or PNG files.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0f172a]">Images to PDF</h1>
        <p className="text-[#64748b] mt-2">Convert JPG and PNG images into a single PDF document instantly.</p>
      </div>

      {!downloadUrl ? (
        <div className="flex-1 flex flex-col">
          <div 
            {...getRootProps()}
            className={cn(
              "bg-[#f1f5f9] border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99]",
              isDragActive ? "border-[#3b82f6] bg-[#e2e8f0]" : "border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#e2e8f0]"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-[48px] mb-4 text-[#3b82f6] leading-none transition-transform group-hover:scale-110">
              <ImagePlus size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">
              {isDragActive ? "Drop images here..." : "Select Images"}
            </h2>
            <p className="text-[#64748b] text-[15px] mb-6 max-w-sm">
              Works with JPG and PNG formats. Each image becomes a single page in the resulting PDF. You can also drag and drop them here.
            </p>
            <div className="bg-[#3b82f6] group-hover:bg-blue-600 text-white px-6 py-3 rounded-[10px] font-semibold transition-colors border-none text-[14px]">
              Select image files
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[18px] text-[#0f172a]">Images to convert ({images.length})</h3>
                <button 
                  onClick={clearAllImages}
                  className="text-sm font-semibold text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
              
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <SortableContext 
                    items={images.map(i => i.id)}
                    strategy={rectSortingStrategy}
                  >
                    {images.map((item) => (
                      <SortableImageItem 
                        key={item.id} 
                        item={item} 
                        onRemove={() => removeImage(item.id)} 
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>

              <div className="mt-8 bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-6 mb-6">
                <h4 className="font-bold text-[#0f172a] mb-4 text-sm uppercase tracking-wider">Page Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#64748b] mb-2">Page Layout</label>
                    <select 
                      value={formatMode} 
                      onChange={(e) => setFormatMode(e.target.value as any)}
                      className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-4 py-3 text-sm font-bold text-[#0f172a] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all"
                    >
                      <option value="fit">Fit Image Exactly (Auto)</option>
                      <option value="a4-portrait">A4 Portrait</option>
                      <option value="a4-landscape">A4 Landscape</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#64748b] mb-2">Margins</label>
                    <select 
                      value={marginMode} 
                      onChange={(e) => setMarginMode(e.target.value as any)}
                      className="w-full bg-white border border-[#e2e8f0] rounded-[8px] px-4 py-3 text-sm font-bold text-[#0f172a] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all"
                    >
                      <option value="none">No Margin (0px)</option>
                      <option value="small">Small (20px)</option>
                      <option value="large">Large (50px)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleConvert}
                  disabled={images.length === 0 || isProcessing}
                  className={cn(
                    "bg-[#3b82f6] text-white px-8 py-3 rounded-[10px] font-bold text-[16px] flex items-center gap-2 transition-all border-none",
                    (images.length === 0 || isProcessing) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:opacity-90 active:scale-[0.98]"
                  )}
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" /> Converting...</>
                  ) : (
                    <>Create PDF <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-[20px] border border-[#e2e8f0] p-12">
          <div className="w-24 h-24 bg-[#f1f5f9] text-[#3b82f6] rounded-full flex items-center justify-center mb-6">
            <FileDown size={48} />
          </div>
          <h2 className="text-[28px] font-extrabold text-[#0f172a] mb-4">Images converted to PDF!</h2>
          <p className="text-[#64748b] max-w-md mb-8 leading-relaxed">
            Your images have been combined into a high-quality PDF document.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
            <button 
              onClick={() => { setDownloadUrl(null); clearAllImages(); }}
              className="px-6 py-3 rounded-[10px] border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold hover:bg-[#f1f5f9] transition-colors order-2 sm:order-1"
            >
              Convert more images
            </button>
            <a 
              href={downloadUrl}
              download="images_easyaspdf.pdf"
              className="px-6 py-3 rounded-[10px] bg-[#3b82f6] text-white font-semibold hover:bg-blue-600 transition-colors shadow-sm flex-1 max-w-[200px] order-1 sm:order-2 text-center"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File as FileIcon, FileDown, ArrowRight, Loader2, Files, GripVertical } from 'lucide-react';
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FileItem {
  id: string;
  file: File;
}

function SortableFileItem({ item, onRemove }: { item: FileItem; key?: React.Key; onRemove: () => void }) {
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
        "flex items-center p-4 gap-4 bg-white hover:bg-slate-50 transition-colors group",
        isDragging && "shadow-xl border-blue-500 bg-blue-50/50 scale-[1.02] rounded-[10px]"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="p-2 cursor-grab active:cursor-grabbing text-[#94a3b8] hover:text-[#0f172a] rounded-lg hover:bg-white"
      >
        <GripVertical size={20} />
      </div>
      <FileIcon size={24} className="text-[#3b82f6]" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[#0f172a] truncate">{item.file.name}</p>
        <p className="text-xs text-[#64748b]">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onRemove}
          className="p-2 w-10 h-10 flex items-center justify-center ml-1 text-red-500 hover:text-red-700 hover:bg-red-50 bg-red-50/50 md:bg-transparent rounded-[10px] transition-all active:scale-90"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export default function MergePdf() {
  const [files, setFiles] = useState<FileItem[]>([]);
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
      .filter(f => f.type === 'application/pdf')
      .map(file => ({ id: `${file.name}-${Date.now()}-${Math.random()}`, file }));
    setFiles(prev => [...prev, ...selectedFiles]);
    setDownloadUrl(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  } as any);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    
    try {
      setIsProcessing(true);
      
      const mergedPdf = await PDFDocument.create();
      
      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert('An error occurred while merging PDFs. Please check the console or ensure your PDFs are valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#0f172a]">Merge PDF Files</h1>
          <p className="text-[#64748b] mt-2">Combine PDFs in the order you want with the easiest PDF merger available.</p>
        </div>
      </div>

      {!downloadUrl ? (
        <div className="flex-1 flex flex-col">
          {/* File input area */}
          <div 
            {...getRootProps()}
            className={cn(
              "bg-[#f1f5f9] border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.99]",
              isDragActive ? "border-[#3b82f6] bg-[#e2e8f0]" : "border-[#cbd5e1] hover:border-[#3b82f6] hover:bg-[#e2e8f0]"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-[48px] mb-4 text-[#3b82f6] transition-transform group-hover:scale-110">
              <Files size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">
              {isDragActive ? "Drop files here..." : "Select PDF Files"}
            </h2>
            <p className="text-[#64748b] text-[15px] mb-6 max-w-sm">
              We highly recommend selecting the files in the order you want them to be merged. You can format the order later too.
            </p>
            <div className="bg-[#3b82f6] group-hover:bg-blue-600 text-white px-6 py-3 rounded-[10px] font-semibold transition-colors border-none text-[14px]">
              Select PDF files
            </div>
          </div>

          {/* Selected files list */}
          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0f172a] text-[18px]">Files to merge ({files.length})</h3>
                <button 
                  onClick={() => setFiles([])}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold"
                >
                  Clear all
                </button>
              </div>
              
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="bg-white rounded-[20px] border border-[#e2e8f0] divide-y divide-[#e2e8f0] overflow-hidden">
                  <SortableContext 
                    items={files.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {files.map((item) => (
                      <SortableFileItem 
                        key={item.id} 
                        item={item} 
                        onRemove={() => removeFile(item.id)} 
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className={cn(
                    "bg-[#3b82f6] text-white px-8 py-4 rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all border-none focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                    (files.length < 2 || isProcessing) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:opacity-90 active:scale-[0.98]"
                  )}
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" /> Processing...</>
                  ) : (
                    <>Merge PDFs <ArrowRight size={20} /></>
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
          <h2 className="text-[28px] font-extrabold text-[#0f172a] mb-4">PDFs merged successfully!</h2>
          <p className="text-[#64748b] max-w-md mb-8 leading-relaxed">
            Your documents have been packed into a single PDF. Everything happened in your browser, maintaining your privacy.
          </p>
          <div className="flex gap-4 w-full max-w-md justify-center">
            <button 
              onClick={() => { setDownloadUrl(null); setFiles([]); }}
              className="px-6 py-3 rounded-[10px] border border-[#e2e8f0] bg-white text-[#0f172a] font-semibold hover:bg-[#f1f5f9] transition-colors"
            >
              Merge more files
            </button>
            <a 
              href={downloadUrl}
              download="merged_easyaspdf.pdf"
              className="px-6 py-3 rounded-[10px] bg-[#3b82f6] text-white font-semibold hover:bg-blue-600 transition-colors shadow-sm flex-1 max-w-[200px]"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

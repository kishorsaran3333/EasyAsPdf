import React from 'react';
import { Link } from 'react-router-dom';
import {
  PrimaryCardIcon,
  MergeIcon,
  SplitIcon,
  WatermarkIcon,
  ImageToPdfIcon,
  CompressIcon,
  ExcelToPdfIcon,
  OcrIcon,
  AllToolsIcon
} from '../components/CustomIcons';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col h-full min-h-[600px] md:mt-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4">
        
        {/* Primary Card */}
        <Link to="/merge" className="lg:col-span-2 lg:row-span-2 bg-[#f1f5f9] border-2 border-dashed border-[#3b82f6] rounded-[20px] p-6 lg:p-10 flex flex-col justify-center items-center text-center gap-4 hover:bg-[#e2e8f0] transition-all active:scale-[0.99] group focus:outline-none focus:ring-4 focus:ring-blue-500/20">
          <div className="mb-2 transition-transform group-hover:scale-110">
            <PrimaryCardIcon size={64} />
          </div>
          <h2 className="text-[28px] font-extrabold text-[#0f172a] leading-tight m-0">Start processing your PDFs</h2>
          <p className="text-[#64748b] max-w-[300px] text-[15px] m-0">
            Convert, merge, or split your documents in seconds. 100% Secure & Fast.
          </p>
          <div className="mt-3 px-5 py-3 bg-[#3b82f6] text-white rounded-[10px] text-[14px] font-semibold border-none group-hover:bg-blue-600 transition-all inline-block text-center hover:opacity-90">
            Get Started
          </div>
        </Link>
        
        {/* Merge */}
        <Link to="/merge" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <MergeIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Organize</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">Merge</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Combine multiple files into one PDF.</p>
          </div>
        </Link>
        
        {/* Split */}
        <Link to="/split" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <SplitIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Organize</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">Split</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Extract pages into separate files.</p>
          </div>
        </Link>

        {/* Protect (Accent) -> points to Watermark */}
        <Link to="/watermark" className="bg-[#0f172a] rounded-[20px] p-6 flex flex-col justify-between border-none hover:bg-slate-800 transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-slate-800/30 group">
          <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
            <WatermarkIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/80 mb-2 block tracking-wider">Security</span>
            <h3 className="text-[18px] font-bold text-white mb-1">Watermark</h3>
            <p className="text-[13px] text-white/60 leading-snug m-0">Stamp text over your PDF securely.</p>
          </div>
        </Link>
        
        {/* PDF to Word -> Image to PDF */}
        <Link to="/img-to-pdf" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <ImageToPdfIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Convert</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">Image to PDF</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Turn JPG/PNG into PDF documents.</p>
          </div>
        </Link>
        
        {/* Compress */}
        <Link to="/compress" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <CompressIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Optimize</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">Compress</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Reduce file size without losing quality.</p>
          </div>
        </Link>

        {/* Excel to PDF */}
        <Link to="/excel-to-pdf" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group text-[#0f172a]">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <ExcelToPdfIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Convert</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">Excel to PDF</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Convert spreadsheets with formatting.</p>
          </div>
        </Link>

        {/* OCR Reader */}
        <Link to="/ocr" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group text-[#0f172a]">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <OcrIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Edit</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">OCR Reader</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Turn scanned images into searchable text.</p>
          </div>
        </Link>

        {/* All Tools */}
        <Link to="/all-tools" className="bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#3b82f6] transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#3b82f6]/20 group text-[#0f172a]">
          <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/20 transition-colors">
            <AllToolsIcon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#3b82f6] mb-2 block tracking-wider">Advanced</span>
            <h3 className="text-[18px] font-bold text-[#0f172a] mb-1">All Tools</h3>
            <p className="text-[13px] text-[#64748b] leading-snug m-0">Explore 20+ specialized PDF utilities.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}

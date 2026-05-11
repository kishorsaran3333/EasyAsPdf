import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, FileDown, Scissors, Link as LinkIcon, ImagePlus, Stamp, Shrink, Table, ScanText } from 'lucide-react';

const tools = [
  {
    path: '/merge',
    icon: <LinkIcon size={24} />,
    title: 'Merge PDF',
    desc: 'Combine multiple files into one PDF.',
    color: 'bg-blue-100 text-blue-600',
    hover: 'hover:border-blue-500'
  },
  {
    path: '/split',
    icon: <Scissors size={24} />,
    title: 'Split PDF',
    desc: 'Extract pages into separate files.',
    color: 'bg-green-100 text-green-600',
    hover: 'hover:border-green-500'
  },
  {
    path: '/compress',
    icon: <Shrink size={24} />,
    title: 'Compress PDF',
    desc: 'Reduce file size without losing quality.',
    color: 'bg-orange-100 text-orange-600',
    hover: 'hover:border-orange-500'
  },
  {
    path: '/watermark',
    icon: <Stamp size={24} />,
    title: 'Watermark PDF',
    desc: 'Stamp text over your PDF securely.',
    color: 'bg-slate-800 text-white',
    hover: 'hover:border-slate-800'
  },
  {
    path: '/img-to-pdf',
    icon: <ImagePlus size={24} />,
    title: 'Image to PDF',
    desc: 'Turn JPG/PNG into PDF documents.',
    color: 'bg-purple-100 text-purple-600',
    hover: 'hover:border-purple-500'
  },
  {
    path: '/excel-to-pdf',
    icon: <Table size={24} />,
    title: 'Excel to PDF',
    desc: 'Convert spreadsheets to PDF.',
    color: 'bg-emerald-100 text-emerald-600',
    hover: 'hover:border-emerald-500'
  },
  {
    path: '/ocr',
    icon: <ScanText size={24} />,
    title: 'OCR Reader',
    desc: 'Turn scanned images into searchable text.',
    color: 'bg-indigo-100 text-indigo-600',
    hover: 'hover:border-indigo-500'
  }
];

export default function AllTools() {
  return (
    <div className="flex-1 max-w-5xl mx-auto w-full py-10 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-[#3b82f6]/10 text-xl mb-4 text-[#3b82f6]">
          <Layers size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4 tracking-tight">All PDF Tools</h1>
        <p className="text-[#64748b] text-lg max-w-xl mx-auto leading-relaxed">
          Everything you need to work with PDFs in one place. 100% free and runs locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, idx) => (
          <Link 
            key={idx}
            to={tool.path} 
            className={`bg-white border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col gap-4 transition-all active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-slate-200 group ${tool.hover}`}
          >
            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${tool.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
              {tool.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-2 inline-flex items-center gap-2 group-hover:text-[#3b82f6] transition-colors">
                {tool.title}
              </h3>
              <p className="text-[14px] text-[#64748b] leading-relaxed m-0">
                {tool.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

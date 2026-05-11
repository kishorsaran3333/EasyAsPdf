import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogoIcon } from './CustomIcons';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col bg-[#fdfdfd] text-[#0f172a] font-sans md:overflow-hidden max-w-[1200px] w-full mx-auto p-4 md:p-8 gap-6">
      <header className="flex justify-between items-center shrink-0">
        <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 active:scale-95 transition-transform group">
          <LogoIcon size={32} className="group-hover:scale-105 transition-transform" />
          EasyAs<span className="text-[#3b82f6]">PDF</span>
        </Link>
        <nav className="hidden md:flex gap-5 text-sm font-medium text-[#64748b]">
          <Link to="/" className="hover:text-[#0f172a] transition-colors active:scale-95">Tools</Link>
          <a href="https://github.com/pdf-lib/pdf-lib" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-[#0f172a] transition-colors active:scale-95">Powered by pdf-lib</a>
        </nav>
        <div className="flex gap-4">
          <button className="px-[20px] py-[10px] bg-[#3b82f6] text-white rounded-[10px] text-[14px] font-semibold cursor-pointer border-none hover:opacity-90 transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500/30">
            Sign Up Free
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-hidden overflow-y-auto pb-4 md:pb-0 min-h-0 flex flex-col">
        <Outlet />
      </div>

      <footer className="shrink-0 flex justify-between items-center pt-4 border-t border-[#e2e8f0] text-[12px] text-[#64748b] pb-2 md:pb-0">
        <div>&copy; 2026 easyaspdf.com - The simplest PDF toolkit on the web.</div>
        <div className="hidden sm:flex gap-6">
          <span className="cursor-pointer hover:text-[#0f172a] transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-[#0f172a] transition-colors">Terms of Service</span>
          <span className="cursor-pointer hover:text-[#0f172a] transition-colors">Help Center</span>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';

export const LogoIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="url(#logo-grad)" />
    <path d="M14 2V8H20" fill="white" fillOpacity="0.3" />
    <path d="M9 13H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 17H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PrimaryCardIcon = ({ size = 48, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="drop-shadow(0 4px 6px rgba(59, 130, 246, 0.2))">
      <rect x="8" y="8" width="24" height="32" rx="4" fill="#60A5FA" />
      <rect x="16" y="4" width="24" height="32" rx="4" fill="#3B82F6" />
      <path d="M24 16H32M24 22H32M24 28H28" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="36" cy="28" r="8" fill="#F59E0B" />
      <path d="M36 24V32M32 28H40" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

export const MergeIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="3" width="8" height="12" rx="2" fill="#3b82f6" fillOpacity="0.8"/>
    <rect x="13" y="9" width="8" height="12" rx="2" fill="#8b5cf6" fillOpacity="0.8"/>
    <path d="M7 11L17 5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

export const SplitIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="6" y="2" width="12" height="20" rx="2" fill="#8b5cf6" />
    <path d="M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
    <circle cx="12" cy="12" r="3" fill="#ec4899" />
  </svg>
);

export const WatermarkIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#1e293b" />
    <path d="M8 8H16M8 12H16M8 16H12" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="6" fill="#3b82f6" />
    <path d="M16 13V16H18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ImageToPdfIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="6" width="14" height="12" rx="2" fill="#f59e0b" />
    <circle cx="7" cy="10" r="1.5" fill="white" />
    <path d="M2 18L7 13L10 16L12 14L16 18" fill="white" fillOpacity="0.5" />
    <rect x="8" y="2" width="14" height="18" rx="2" fill="#3b82f6" fillOpacity="0.9" />
    <path d="M12 7H18M12 11H18M12 15H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CompressIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#10b981" />
    <path d="M12 6V18M12 18L8 14M12 18L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 4L18 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 20L18 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ExcelToPdfIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="4" width="14" height="16" rx="2" fill="#10b981" />
    <path d="M6 8H12M6 12H12M6 16H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 6V18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="10" y="2" width="12" height="16" rx="2" fill="#3b82f6" />
    <path d="M13 7H19M13 11H19M13 15H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const OcrIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 6V4H6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 4H20V6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 18V20H6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 20H20V18" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="7" width="10" height="10" rx="1" fill="#8b5cf6" />
    <path d="M2 12H22" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 4" />
  </svg>
);

export const AllToolsIcon = ({ size = 24, className = '' }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" fill="#3b82f6" />
    <rect x="11" y="4" width="2" height="4" rx="1" fill="#3b82f6" />
    <rect x="11" y="16" width="2" height="4" rx="1" fill="#3b82f6" />
    <rect x="4" y="11" width="4" height="2" rx="1" fill="#3b82f6" />
    <rect x="16" y="11" width="4" height="2" rx="1" fill="#3b82f6" />
    <circle cx="12" cy="12" r="2" fill="white" />
  </svg>
);

import React, { useState, useEffect } from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  withUpload?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  withUpload = false,
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sman1_custom_logo_b64');
    } catch {
      return null;
    }
  });
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 min-w-8',
    md: 'h-10 w-10 min-w-10',
    lg: 'h-14 w-14 min-w-14',
    xl: 'h-20 w-20 min-w-20',
    '2xl': 'h-28 w-28 min-w-28',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        try {
          localStorage.setItem('sman1_custom_logo_b64', base64);
        } catch {
          // localStorage full or restricted
        }
        setCustomLogo(base64);
        setImgError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const logoSrc = customLogo || '/logo_sekolah.jpg';

  return (
    <div className={`relative inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-full border border-slate-200/80 bg-white p-0.5 shadow-xs transition-transform hover:scale-105 ${sizeClasses[size]}`}
      >
        {!imgError ? (
          <img
            src={logoSrc}
            alt="Logo SMAN 1 Belitang Hilir"
            className="h-full w-full object-contain rounded-full"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* High quality SVG vector fallback */
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#111827" strokeWidth="4" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#111827" strokeWidth="1.5" />
            <path
              d="M20 70 Q 15 45 28 25 Q 24 45 35 65 Z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="0.5"
            />
            <path
              d="M80 70 Q 85 45 72 25 Q 76 45 65 65 Z"
              fill="#eab308"
              stroke="#ca8a04"
              strokeWidth="0.5"
            />
            {/* Book pages */}
            <path d="M50 64 Q 32 60 26 50 Q 38 46 50 56 Z" fill="#1d4ed8" />
            <path d="M50 64 Q 68 60 74 50 Q 62 46 50 56 Z" fill="#1d4ed8" />
            <path d="M50 56 Q 32 50 28 42 Q 40 38 50 48 Z" fill="#06b6d4" />
            <path d="M50 56 Q 68 50 72 42 Q 60 38 50 48 Z" fill="#06b6d4" />
            <path d="M50 48 Q 33 42 30 35 Q 42 30 50 40 Z" fill="#f97316" />
            <path d="M50 48 Q 67 42 70 35 Q 58 30 50 40 Z" fill="#f97316" />
            {/* Flame */}
            <path
              d="M50 20 Q 56 30 50 38 Q 44 30 50 20 Z"
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="0.5"
            />
            {/* Pen tip */}
            <polygon points="46,67 54,67 50,75" fill="#111827" />
          </svg>
        )}

        {withUpload && (
          <label
            title="Klik untuk ganti logo sekolah"
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-full text-white text-[9px] font-bold"
          >
            Ganti
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-xs font-black tracking-wide text-slate-900 leading-tight uppercase">
            SMAN 1 Belitang Hilir
          </span>
          <span className="text-[10px] font-semibold text-indigo-600">
            CBT & Bank Soal Terpadu
          </span>
        </div>
      )}
    </div>
  );
};

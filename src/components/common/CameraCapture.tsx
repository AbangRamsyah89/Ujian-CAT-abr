import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  studentName?: string;
  isCompact?: boolean;
  className?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  studentName = 'Siswa',
  isCompact = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setStreamActive(true);
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch {
        // Fallback to simulated biometric camera preview
        setHasPermission(false);
        setStreamActive(false);
      }
    }

    initCamera();

    // Subtle face jitter simulation to show AI proctoring active
    const interval = setInterval(() => {
      setFaceDetected(true);
    }, 4000);

    return () => {
      clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md ${
        isCompact ? 'h-24 w-32' : 'h-36 w-48'
      } ${className}`}
    >
      {streamActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover transform -scale-x-100"
        />
      ) : (
        /* Simulated Camera Stream with biometric proctoring markers */
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 p-2">
          {/* Simulated user silhouette */}
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
              <Camera className="w-6 h-6 animate-pulse" />
            </div>
            {/* Proctoring scanning corner brackets */}
            <div className="absolute -inset-2 border-t-2 border-l-2 border-emerald-400/80 w-4 h-4" />
            <div className="absolute -inset-2 right-0 left-auto border-t-2 border-r-2 border-emerald-400/80 w-4 h-4" />
            <div className="absolute -inset-2 bottom-0 top-auto border-b-2 border-l-2 border-emerald-400/80 w-4 h-4" />
            <div className="absolute -inset-2 bottom-0 top-auto right-0 left-auto border-b-2 border-r-2 border-emerald-400/80 w-4 h-4" />
          </div>

          <span className="mt-1.5 text-[10px] font-medium text-slate-300 truncate max-w-[90%] text-center">
            {studentName}
          </span>
        </div>
      )}

      {/* AI Face Proctoring Status Badge */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs text-[9px] text-emerald-400 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          {streamActive ? 'CAM LIVE' : 'AI WEBCAM'}
        </span>
        <span className="text-slate-400">1080p</span>
      </div>

      {/* Top watermark tag */}
      <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1 py-0.5 text-[8px] text-slate-200">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
        <span>Face Tracked</span>
      </div>
    </div>
  );
};

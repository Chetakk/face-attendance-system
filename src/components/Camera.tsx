import { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, X } from 'lucide-react';

interface CameraProps {
  onCapture: (video: HTMLVideoElement) => void;
  isActive: boolean;
  onClose?: () => void;
}

export default function Camera({ onCapture, isActive, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError('');
      }
    } catch (err) {
      setError('Unable to access camera. Please grant camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      onCapture(videoRef.current);
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Camera</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-gray-900"
            />
            <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none opacity-50"></div>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <CameraIcon size={20} />
            Capture Face
          </button>
        </div>
      </div>
    </div>
  );
}

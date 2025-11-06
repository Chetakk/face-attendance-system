import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Camera from './Camera';
import { detectFace, compareFaces, getFaceDescriptor, loadModels } from '../services/faceRecognition';
import { supabase, User } from '../lib/supabase';

export default function AttendanceMarker() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCapture = async (video: HTMLVideoElement) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      await loadModels();

      const detection = await detectFace(video);

      if (!detection) {
        setMessage({ type: 'error', text: 'No face detected. Please ensure your face is clearly visible.' });
        setIsProcessing(false);
        return;
      }

      const currentDescriptor = getFaceDescriptor(detection);

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .not('face_descriptor', 'is', null);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        setMessage({ type: 'error', text: 'No registered users found. Please register first.' });
        setIsProcessing(false);
        return;
      }

      let bestMatch: { user: User; confidence: number } | null = null;

      for (const user of users) {
        if (user.face_descriptor) {
          const confidence = compareFaces(
            detection.descriptor,
            user.face_descriptor as number[]
          );

          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { user, confidence };
          }
        }
      }

      if (bestMatch && bestMatch.confidence > 0.6) {
        const { error: attendanceError } = await supabase
          .from('attendance_records')
          .insert({
            user_id: bestMatch.user.id,
            face_match_confidence: (bestMatch.confidence * 100).toFixed(2),
          });

        if (attendanceError) throw attendanceError;

        setMessage({
          type: 'success',
          text: `Welcome ${bestMatch.user.name}! Attendance marked successfully.`,
        });
        setIsCameraActive(false);
      } else {
        setMessage({
          type: 'error',
          text: 'Face not recognized. Please try again or register first.',
        });
      }
    } catch (error) {
      console.error('Error processing face:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mark Attendance</h2>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={24} className="flex-shrink-0" />
          ) : (
            <XCircle size={24} className="flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Click the button below to activate the camera and mark your attendance using facial recognition.
        </p>

        <button
          onClick={() => setIsCameraActive(true)}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Start Camera'
          )}
        </button>
      </div>

      <Camera
        isActive={isCameraActive}
        onCapture={handleCapture}
        onClose={() => setIsCameraActive(false)}
      />
    </div>
  );
}

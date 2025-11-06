import { useState } from 'react';
import { UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Camera from './Camera';
import { detectFace, getFaceDescriptor, loadModels } from '../services/faceRecognition';
import { supabase } from '../lib/supabase';

export default function UserRegistration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);

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

      const descriptor = getFaceDescriptor(detection);
      setFaceDescriptor(descriptor);
      setMessage({ type: 'success', text: 'Face captured successfully! Now submit the form to complete registration.' });
      setIsCameraActive(false);
    } catch (error) {
      console.error('Error capturing face:', error);
      setMessage({ type: 'error', text: 'An error occurred while capturing your face. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!faceDescriptor) {
      setMessage({ type: 'error', text: 'Please capture your face before submitting.' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('users').insert({
        name,
        email,
        face_descriptor: faceDescriptor,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: `Registration successful! Welcome, ${name}!` });
      setName('');
      setEmail('');
      setFaceDescriptor(null);
    } catch (error: any) {
      console.error('Error registering user:', error);
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'This email is already registered.' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred during registration. Please try again.' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="text-blue-600" size={32} />
        <h2 className="text-2xl font-bold text-gray-900">Register New User</h2>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Face Recognition
          </label>
          <button
            type="button"
            onClick={() => setIsCameraActive(true)}
            disabled={isProcessing}
            className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              faceDescriptor
                ? 'bg-green-50 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {faceDescriptor ? (
              <>
                <CheckCircle size={20} />
                Face Captured
              </>
            ) : (
              'Capture Face'
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !faceDescriptor}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Register User
            </>
          )}
        </button>
      </form>

      <Camera
        isActive={isCameraActive}
        onCapture={handleCapture}
        onClose={() => setIsCameraActive(false)}
      />
    </div>
  );
}

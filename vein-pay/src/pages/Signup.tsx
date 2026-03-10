import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Building2, Eye, EyeOff, User, Camera, UploadCloud } from 'lucide-react';
import Webcam from 'react-webcam';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../context/AuthContext';

interface SignupProps {
  onSwitch: () => void;
}

export default function Signup({ onSwitch }: SignupProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<UserRole>('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [palmMethod, setPalmMethod] = useState<'camera' | 'upload'>('camera');
  const [palmImage, setPalmImage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { signup } = useAuth();
  const webcamRef = useRef<Webcam>(null);

  const handlePalmCapture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPalmImage(imageSrc);
    }
  };

  const handlePalmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPalmImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Biometric validation ONLY for Personal accounts
    if (role === 'personal' && !palmImage) {
      setError('Please enroll your palm for biometric payments');
      return;
    }

    try {
      setIsRegistering(true);

      // 1. Call Register API
      const registerPayload = {
        username,
        password,
        role,
        business_name: role === 'business' ? businessName : undefined,
        palm_image: role === 'personal' ? palmImage : null, // Only send image for personal
      };

      console.log('[Signup] /register starting', registerPayload);
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      console.log('[Signup] /register response', response.status, response.statusText);
      const data = await response.json().catch(() => null);
      console.log('[Signup] /register body', data);

      if (!response.ok) {
        setError((data && (data.detail || data.error)) || 'Registration failed');
        return;
      }

      // 2. Perform Login to get JWT
      const loginParams = new URLSearchParams();
      loginParams.append('username', username);
      loginParams.append('password', password);

      const authRes = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginParams,
      });

      const authData = await authRes.json().catch(() => null);

      if (authRes.ok) {
        localStorage.setItem('access_token', authData.access_token);
        signup(username, password, role, businessName);
      }
    } catch (err) {
      setError('Could not connect to VeinPay server');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join VeinPay Today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div className="flex gap-3 mb-6">
              {(['personal', 'business'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setPalmImage(null); }}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === r ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r === 'personal' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  {r === 'personal' ? 'Personal' : 'Business'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="23211A0524"
                />
              </div>
            </div>

            {role === 'business' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="Enter business name"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* CONDITIONAL BIOMETRIC SECTION: ONLY FOR PERSONAL ACCOUNTS */}
            {role === 'personal' && (
              <div className="mt-4 border border-blue-100 rounded-xl p-4 bg-blue-50/50">
                <h3 className="text-sm font-bold text-blue-900 mb-1">Biometric Enrollment</h3>
                <p className="text-[10px] text-blue-600 mb-3 uppercase font-semibold">Palm required for payment authentication</p>

                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setPalmMethod('camera')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ${palmMethod === 'camera' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
                    <Camera className="w-4 h-4" /> Camera
                  </button>
                  <button type="button" onClick={() => setPalmMethod('upload')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ${palmMethod === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
                    <UploadCloud className="w-4 h-4" /> Upload
                  </button>
                </div>

                {palmMethod === 'camera' ? (
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 rounded-full border-2 border-blue-500/60 border-dashed animate-pulse" />
                      </div>
                    </div>
                    <button type="button" onClick={handlePalmCapture} className="w-full text-xs bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-black">Capture Template</button>
                  </div>
                ) : (
                  <input type="file" accept="image/*" onChange={handlePalmUpload} className="block w-full text-[10px] text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-full file:bg-blue-100 file:text-blue-700" />
                )}

                {palmImage && <p className="text-[10px] text-green-600 mt-2 font-bold italic">✓ Biometric Data Prepared</p>}
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">{error}</div>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isRegistering}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              {isRegistering ? 'Processing Registration...' : 'Create Account'}
            </motion.button>
          </form>

          <button onClick={onSwitch} className="w-full mt-6 text-sm text-blue-600 font-medium">Already have an account? Sign In</button>
        </motion.div>
      </div>
    </motion.div>
  );
}
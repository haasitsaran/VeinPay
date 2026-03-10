import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, RefreshCw, UploadCloud } from 'lucide-react';
import Webcam from 'react-webcam';
import testPalmImage from '../assets/img-1.jpeg';

interface CameraScannerModeProps {
  amount: number;
  onBack: () => void;
  onClose: () => void;
}

export default function CameraScannerMode({ amount, onBack, onClose }: CameraScannerModeProps) {
  const webcamRef = useRef<Webcam>(null);
  const [stage, setStage] = useState<'camera' | 'scanning' | 'complete'>('camera');
  const [token, setToken] = useState('');
  const [scanMethod, setScanMethod] = useState<'camera' | 'upload'>('camera');
  const [uploadedPalm, setUploadedPalm] = useState<string | null>(null);

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    
    // 1. Capture the image from the webcam
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setStage('scanning');

    try {
      // 2. Send to your FastAPI Backend (Tested at http://127.0.0.1:8000/process-scan)
      const response = await fetch('http://127.0.0.1:8000/process-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` 
        },
        body: JSON.stringify({
          image: imageSrc,
          mode: 'camera'
        })
      });

      const data = await response.json();

      if (response.ok && data.match) {
        // 3. Successful Match - Set the One-Time Token (OTT) from backend
        setToken(data.ott || "VP-" + Math.random().toString(36).substr(2, 9).toUpperCase());
        setStage('complete');
      } else {
        alert("Biometric mismatch or unauthorized. Please try again.");
        setStage('camera');
      }
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Could not connect to VeinPay server.");
      setStage('camera');
    } finally {
    }
  }, [webcamRef]);

  const handleUploadPalm = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidType =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      /\.(jpg|jpeg|png)$/i.test(file.name);

    if (!isValidType) {
      alert('Please upload a JPG or PNG image.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setUploadedPalm(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleProcessBase64 = useCallback(async (base64Image: string, source: 'camera' | 'upload' | 'static', modeOverride?: string) => {
    setStage('scanning');

    try {
      console.log(`[CameraScannerMode] /process-scan starting (${source})`);
      const response = await fetch('http://127.0.0.1:8000/process-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          image: base64Image,
          mode: modeOverride ?? source,
        }),
      });

      console.log(`[CameraScannerMode] /process-scan response (${source})`, response.status, response.statusText);
      const data = await response.json().catch(() => null);
      console.log(`[CameraScannerMode] /process-scan body (${source})`, data);

      if (response.ok && data?.match) {
        setToken(data.ott || "VP-" + Math.random().toString(36).substr(2, 9).toUpperCase());
        setStage('complete');
      } else {
        alert(data?.detail || "Biometric mismatch or unauthorized. Please try again.");
        setStage('camera');
      }
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Could not connect to VeinPay server.");
      setStage('camera');
    } finally {
    }
  }, []);

  const handleScanUploaded = useCallback(async () => {
    if (!uploadedPalm) {
      alert('Please upload a palm image first.');
      return;
    }
    await handleProcessBase64(uploadedPalm, 'upload');
  }, [uploadedPalm, handleProcessBase64]);

  const handleEnrollUploaded = useCallback(async () => {
    if (!uploadedPalm) {
      alert('Please upload a palm image first.');
      return;
    }
    await handleProcessBase64(uploadedPalm, 'upload', 'enroll');
  }, [uploadedPalm, handleProcessBase64]);

  const handleTestStaticImage = useCallback(async () => {
    try {
      const imageResponse = await fetch(testPalmImage);
      const imageBlob = await imageResponse.blob();

      const base64Image: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      await handleProcessBase64(base64Image, 'static');
    } catch (error) {
      console.error("Backend Error (static image):", error);
      alert("Could not connect to VeinPay server (static image).");
      setStage('camera');
    }
  }, [handleProcessBase64]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {stage === 'camera' && (
        <div className="text-center py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Position Your Palm</h3>
          <p className="text-gray-600 mb-4 text-sm">Align your palm within the circle or upload the same enrolled image</p>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setScanMethod('camera')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ${
                scanMethod === 'camera'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              Live Camera Scan
            </button>
            <button
              type="button"
              onClick={() => setScanMethod('upload')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ${
                scanMethod === 'upload'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload Image
            </button>
          </div>

          {scanMethod === 'camera' && (
            <>
              <div className="relative aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-4 border-blue-500/50 border-dashed animate-pulse" />
                </div>
              </div>

              <button
                onClick={handleCapture}
                className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
              >
                <Camera className="w-5 h-5" />
                Scan Now
              </button>
            </>
          )}

          {scanMethod === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleUploadPalm}
                className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadedPalm && (
                <p className="text-[11px] text-green-600">
                  Image ready. Click scan to send the same Base64 to backend.
                </p>
              )}
              <button
                onClick={handleScanUploaded}
                className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
              >
                <UploadCloud className="w-5 h-5" />
                Scan Uploaded Image
              </button>
              <button
                onClick={handleEnrollUploaded}
                className="w-full bg-gray-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black shadow-lg transition-all"
              >
                <UploadCloud className="w-5 h-5" />
                Enroll Uploaded Image (save template)
              </button>
            </div>
          )}
          
          <button
            onClick={handleTestStaticImage}
            className="mt-2 text-[11px] text-gray-400 opacity-0 hover:opacity-100 focus:opacity-100 underline decoration-dotted"
          >
            Test with Static Image
          </button>
        </div>
      )}

      {stage === 'scanning' && (
        <div className="text-center py-8">
          <div className="relative aspect-video bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden">
             {/* Simulated NIR Visualization based on your methodology */}
             <motion.div 
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="text-red-500"
             >
                <RefreshCw className="w-16 h-16 animate-spin-slow" />
             </motion.div>
             <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_15px_red] animate-scan" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Vein Pattern</h3>
          <p className="text-gray-600 mb-4 text-sm italic">Extracting DCNN feature vector...</p>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="text-red-600 font-bold uppercase tracking-wider">Liveness Check</span>
              <span className="text-red-700 font-semibold">Verified</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
              />
            </div>
          </div>
        </div>
      )}

      {stage === 'complete' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Biometric Verified</h3>
          <p className="text-gray-600 mb-6 text-sm">
            Palm pattern matched via CNN fusion. <br/>
            <strong>₹{amount.toFixed(2)}</strong> authorized.
          </p>

          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 mb-6">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-widest">Secure One-Time Token</p>
            <p className="font-mono text-lg font-bold text-blue-600 tracking-tighter">{token}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl"
          >
            Finish Transaction
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { ChatbotSettings } from '../types';
import { getTranslation } from '../utils/translations';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseExtracted: (expense: { amount: number; description: string; category: string }) => void;
  settings: ChatbotSettings;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  isOpen,
  onClose,
  onExpenseExtracted,
  settings
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'processing' | 'review'>('capture');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const errorMsg = settings.language === 'ja' 
        ? 'カメラにアクセスできません。権限を確認するか、ファイルアップロードを使用してください。'
        : 'Cannot access camera. Please check permissions or use file upload.';
      setError(errorMsg);
    }
  }, [settings.language]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setStep('processing');
    setError(null);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(imageData, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      setExtractedText(result.data.text);
      setStep('review');
      
      const expenseInfo = extractExpenseFromText(result.data.text);
      if (expenseInfo) {
        onExpenseExtracted(expenseInfo);
      }
    } catch (err) {
      const errorMsg = settings.language === 'ja'
        ? '画像の処理に失敗しました。もう一度試すか、手動で入力してください。'
        : 'Failed to process image. Please try again or enter manually.';
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractExpenseFromText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const totalPatterns = [
      /total[:\s]*\$?(\d+\.?\d*)/i,
      /amount[:\s]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)\s*total/i,
      /grand\s*total[:\s]*\$?(\d+\.?\d*)/i
    ];

    let amount = 0;
    let description = '';

    for (const line of lines) {
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match) {
          const foundAmount = parseFloat(match[1]);
          if (foundAmount > amount) {
            amount = foundAmount;
          }
        }
      }
    }

    if (amount === 0) {
      const amountPattern = /\$(\d+\.?\d*)/g;
      const amounts: number[] = [];
      
      for (const line of lines) {
        let match;
        while ((match = amountPattern.exec(line)) !== null) {
          amounts.push(parseFloat(match[1]));
        }
      }
      
      if (amounts.length > 0) {
        amount = Math.max(...amounts);
      }
    }

    const merchantPatterns = [
      /^([A-Z][A-Z\s&]+)$/,
      /^([A-Z][a-zA-Z\s&]+)$/
    ];

    for (const line of lines.slice(0, 5)) {
      for (const pattern of merchantPatterns) {
        const match = line.match(pattern);
        if (match && match[1].length > 3 && match[1].length < 30) {
          description = match[1].trim();
          break;
        }
      }
      if (description) break;
    }

    if (!description) {
      description = settings.language === 'ja' ? 'レシート支出' : 'Receipt expense';
    }

    const category = categorizeFromDescription(description);

    return amount > 0 ? { amount, description, category } : null;
  };

  const categorizeFromDescription = (description: string): string => {
    const desc = description.toLowerCase();
    
    if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('coffee') || 
        desc.includes('food') || desc.includes('pizza') || desc.includes('burger')) {
      return 'food';
    }
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('shell') || 
        desc.includes('exxon') || desc.includes('bp')) {
      return 'transport';
    }
    if (desc.includes('store') || desc.includes('shop') || desc.includes('mall') || 
        desc.includes('target') || desc.includes('walmart')) {
      return 'shopping';
    }
    if (desc.includes('pharmacy') || desc.includes('cvs') || desc.includes('walgreens') || 
        desc.includes('hospital') || desc.includes('clinic')) {
      return 'health';
    }
    
    return 'other';
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setExtractedText('');
    setError(null);
    setStep('capture');
    setProgress(0);
    stopCamera();
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && step === 'capture') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, step, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="vintage-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden vintage-shadow paper-texture poster-style">
        <div className="flex items-center justify-between p-6 border-b-2 border-red-300">
          <h2 className="text-lg font-bold vintage-text-primary flex items-center gap-3 japanese-text">
            <Camera className="w-6 h-6 text-red-700" />
            {settings.language === 'ja' ? 'レシートスキャン' : settings.language === 'en' ? 'Scan Receipt' : 'レシートスキャン / Scan Receipt'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 vintage-text-primary" />
          </button>
        </div>

        <div className="p-6">
          {step === 'capture' && (
            <div className="space-y-6">
              <div className="relative bg-stone-200 rounded-2xl overflow-hidden aspect-video border-2 border-red-300">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-800 bg-opacity-75">
                    <div className="text-center text-stone-100 p-4">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={capturePhoto}
                  disabled={!!error}
                  className="flex-1 vintage-button py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 retro-hover"
                >
                  <Camera className="w-6 h-6" />
                  {settings.language === 'ja' ? 'レシートを撮影' : 'Capture Receipt'}
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-stone-600 to-stone-700 text-white py-4 px-6 rounded-2xl hover:from-stone-700 hover:to-stone-800 transition-all duration-300 flex items-center justify-center vintage-shadow retro-hover"
                >
                  <Upload className="w-6 h-6" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-red-700" />
              <h3 className="text-lg font-bold mb-3 vintage-text-primary">
                {settings.language === 'ja' ? 'レシートを処理中' : 'Processing Receipt'}
              </h3>
              <p className="vintage-text-secondary mb-6">
                {settings.language === 'ja' ? '支出情報を抽出しています...' : 'Extracting expense information...'}
              </p>
              <div className="w-full bg-stone-300 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-700 to-red-800 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm vintage-text-muted mt-3 font-medium">{progress}%</p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold">
                  {settings.language === 'ja' ? 'レシートの処理が完了しました！' : 'Receipt processed successfully!'}
                </span>
              </div>

              {capturedImage && (
                <div className="relative">
                  <img 
                    src={capturedImage} 
                    alt="Captured receipt" 
                    className="w-full h-32 object-cover rounded-2xl border-2 border-red-300"
                  />
                </div>
              )}

              {extractedText && (
                <div className="bg-stone-100 p-4 rounded-2xl max-h-32 overflow-y-auto border border-red-300">
                  <h4 className="font-bold text-sm vintage-text-primary mb-3">
                    {settings.language === 'ja' ? '抽出されたテキ��ト:' : 'Extracted Text:'}
                  </h4>
                  <p className="text-xs vintage-text-secondary whitespace-pre-wrap">{extractedText}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={resetScanner}
                  className="flex-1 bg-gradient-to-r from-stone-600 to-stone-700 text-white py-3 px-6 rounded-2xl hover:from-stone-700 hover:to-stone-800 transition-all duration-300 vintage-shadow retro-hover"
                >
                  {settings.language === 'ja' ? '別のスキャン' : 'Scan Another'}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 vintage-button py-3 px-6 rounded-2xl transition-all duration-300 retro-hover"
                >
                  {settings.language === 'ja' ? '完了' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
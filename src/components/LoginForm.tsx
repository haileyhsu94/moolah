import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onGoogleLogin: (credentialResponse: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegister, isLoading, error, onGoogleLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      await onLogin(email, password);
    } else {
      await onRegister(email, password, name);
    }
  };

  return (
    <div className="min-h-screen vintage-bg-primary flex items-center justify-center p-4">
      <div className="auth-card w-full max-w-md slide-in-up">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center mb-4 sm:mb-6">
              <img src="/logo.png" alt="Moolah Logo" className="w-full h-full object-contain rounded-[10px]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black vintage-text-primary japanese-text mb-2">
              Moolah
            </h1>
            <p className="vintage-text-secondary font-bold text-sm sm:text-base">
              {isLoginMode ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-400 border-3 border-black rounded-[10px] text-black text-sm font-bold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-black vintage-text-primary mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 vintage-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 auth-input focus:outline-none text-sm sm:text-base"
                    placeholder="Enter your full name"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-black vintage-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 vintage-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 auth-input focus:outline-none text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black vintage-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 vintage-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 auth-input focus:outline-none text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 vintage-text-muted hover:vintage-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full auth-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2 sm:py-3 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLoginMode ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <div className="flex flex-col items-center mt-8 mb-4">
            <GoogleLogin
              onSuccess={onGoogleLogin}
              onError={() => alert('Google Sign In Failed')}
              width="100%"
            />
          </div>

          {/* Toggle Mode */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="vintage-text-secondary text-sm font-medium">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="mt-2 vintage-text-accent hover:underline font-black transition-colors text-sm sm:text-base"
            >
              {isLoginMode ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {/* Demo Account - Only show credentials when not demo user */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-400 border-3 border-black rounded-[10px]">
            <p className="text-sm vintage-text-primary text-center mb-2 font-black">
              Try Demo Account
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@expensechat.com');
                  setPassword('demo123');
                  setIsLoginMode(true);
                }}
                className="text-xs vintage-text-primary font-bold hover:underline transition-colors"
              >
                Click to use demo credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { toast } from 'react-hot-toast';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Invalid access. Please register first.');
      navigate('/register');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      nextInput?.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      prevInput?.focus();
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/verify-otp', {
        email,
        otp: otpString
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Store authentication data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(response.data.message);
        
        // Navigate to dashboard
        navigate('/', { 
          state: { message: 'Welcome to IIITConnect! Your account has been verified successfully.' }
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const message = error.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(message);
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.querySelector('input[name="otp-0"]');
      firstInput?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/resend-otp', {
        email
      });

      if (response.data.success) {
        toast.success('New verification code sent to your email!');
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        
        // Focus first input
        const firstInput = document.querySelector('input[name="otp-0"]');
        firstInput?.focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const message = error.response?.data?.message || 'Failed to resend code. Please try again.';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-medium text-sm break-all">{email}</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    maxLength="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Timer Display */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-500">
                    Code expires in <span className="font-semibold text-red-500">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-medium">Verification code has expired</p>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Account'
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Didn't receive the code?
                  </span>
                </div>
              </div>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {resendLoading ? 'Sending new code...' : 'Send new code'}
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  You can request a new code in {formatTime(timeLeft)}
                </p>
              )}
            </div>
          </form>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-3">
              💡 Check your spam/junk folder if you don't see the email
            </p>
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from '../utils/axios';
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setShowVerificationPrompt(false);

    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        console.log("Login Successful:", response.data);
        
        // ✅ Store authentication data including user object
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        localStorage.setItem("userId", response.data.data.user.id);
        
        toast.success("Login successful!");
        navigate("/");
      }

    } catch (err) {
      console.error("Error during login:", err);
      
      // ✅ Handle email verification required error
      if (err.response?.status === 403 && err.response?.data?.data?.needsVerification) {
        console.log("Email verification required");
        setShowVerificationPrompt(true);
        setError(null); // Clear general error since we're showing verification prompt
        return;
      }
      
      // Handle other errors
      const errorMessage = err.response?.data?.message || "Network error. Please check your connection.";
      setError(errorMessage);
      toast.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle sending OTP for verification
  const handleSendVerificationOTP = async () => {
    setResendingOTP(true);
    
    try {
      const response = await axiosInstance.post('/api/auth/resend-otp', {
        email: formData.email
      });

      if (response.data.success) {
        toast.success('Verification code sent to your email!');
        
        // Navigate to OTP verification page
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            type: 'login',
            message: 'Please verify your email to complete the login process.'
          }
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      const message = error.response?.data?.message || 'Failed to send verification code. Please try again.';
      toast.error(message);
    } finally {
      setResendingOTP(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>
        
        {/* ✅ Email Verification Prompt */}
        {showVerificationPrompt && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.098 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  🔐 Email Verification Required
                </h3>
                <p className="text-amber-700 text-sm mb-4">
                  Your account needs email verification to continue. We'll send a verification code to your email address.
                </p>
                
                {/* ✅ Single Send Code Button */}
                <button
                  onClick={handleSendVerificationOTP}
                  disabled={resendingOTP}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed shadow-sm"
                >
                  {resendingOTP ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Verification Code...
                    </span>
                  ) : (
                    <>
                      📧 Send Verification Code
                    </>
                  )}
                </button>
                
                <p className="text-amber-600 text-xs mt-3 text-center">
                  💡 Check your spam/junk folder if you don't see the email
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General Error Message (only shown when not verification error) */}
        {error && !showVerificationPrompt && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="mb-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </form>

        {/* ✅ Help Section for Verification */}
        {showVerificationPrompt && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Need Help?</strong>
            </p>
            <p className="text-xs text-gray-500">
              Having trouble with email verification? Make sure to check your spam folder or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Fetch email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmailForVerification");
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => router.push('/Login'), 3000);
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ecfbf4] px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Check your inbox</h2>
        {email && (
          <p className="text-gray-600 text-sm">
            Enter the verification code we just sent to <span className="font-medium">{email}</span>.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Code"
            className="w-full p-2 border rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
            Continue
          </button>
        </form>

        {status === 'loading' && <p>🔄 Verifying...</p>}
        {status === 'success' && <p className="text-green-600 font-semibold">✅ Email verified! Redirecting...</p>}
        {status === 'error' && <p className="text-red-500 font-medium">❌ {errorMessage}</p>}
      </div>
    </div>
  );
}

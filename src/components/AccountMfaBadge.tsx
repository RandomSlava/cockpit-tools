import React, { useState, useEffect } from 'react';
import { Copy, Check, ShieldAlert } from 'lucide-react';
import { getMfaOtpToken, getMfaTimeRemaining } from '../utils/mfaVault';

interface AccountMfaBadgeProps {
  secret?: string;
}

export function AccountMfaBadge({ secret }: AccountMfaBadgeProps) {
  const [token, setToken] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [copied, setCopied] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (!secret || !secret.trim()) {
      setToken('');
      setIsValid(false);
      return;
    }

    const updateOtp = () => {
      try {
        const rawToken = getMfaOtpToken(secret);
        if (rawToken) {
          setToken(rawToken);
          setIsValid(true);
        } else {
          setToken('');
          setIsValid(false);
        }
      } catch {
        setToken('');
        setIsValid(false);
      }
      setTimeRemaining(getMfaTimeRemaining());
    };

    updateOtp();
    const interval = setInterval(updateOtp, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy TOTP token:', err);
    }
  };

  if (!secret || !secret.trim()) return null;

  if (!isValid) {
    return (
      <div className="account-mfa-badge invalid" title="Invalid 2FA Secret Key">
        <ShieldAlert size={12} className="warning-icon" />
        <span className="error-text">2FA Error</span>
      </div>
    );
  }

  // Format token into group of 3 digits: e.g. "123 456"
  const formattedToken = token.length === 6 ? `${token.slice(0, 3)} ${token.slice(3)}` : token;

  // Calculate SVG circular progress values
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeRemaining / 30) * circumference;

  return (
    <div className="account-mfa-badge" onClick={handleCopy} title="Click to copy 2FA verification code">
      <div className="badge-glow" />
      <div className="badge-content">
        <span className="otp-code">{formattedToken}</span>
        <button className={`copy-btn ${copied ? 'copied' : ''}`} type="button">
          {copied ? <Check size={12} className="copy-icon" /> : <Copy size={12} className="copy-icon" />}
        </button>
        <div className="timer-wrapper">
          <svg className="timer-svg" width="20" height="20">
            <circle
              className="timer-track"
              cx="10"
              cy="10"
              r={radius}
            />
            <circle
              className="timer-indicator"
              cx="10"
              cy="10"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                stroke: timeRemaining <= 5 ? 'var(--error, #ef4444)' : 'url(#mfa-gradient)',
              }}
            />
            <defs>
              <linearGradient id="mfa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="timer-text">{timeRemaining}</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            const res = await axios.post('/auth/google', {
                idToken: credentialResponse.credential
            });
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.response?.data?.error || 'Google hesabı ilə daxil olarkən xəta baş verdi');
        }
    };

    const handleGoogleError = () => {
        setError('Google ilə daxil olmaq mümkün olmadı');
    };

    return (
        <div className="auth-container" style={{
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            minHeight: '100vh'
        }}>
            <div className="card" style={{
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Join AI Studio
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                    Sign in or create an account with a single click
                </p>

                {error && (
                    <div className="error-msg" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginBottom: '2rem'
                }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        locale="en"
                        size="large"
                        text="continue_with"
                    />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    By continuing, you'll be automatically registered if you don't have an account.
                    <br />
                    <span style={{ opacity: 0.5 }}>Safe & Secure Google Login</span>
                </div>
            </div>
        </div>
    );
};

export default Login;

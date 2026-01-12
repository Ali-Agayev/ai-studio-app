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
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="card" style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                padding: '3rem 2.5rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '16px',
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
                }}>
                    A
                </div>

                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '0.75rem',
                    color: '#ffffff',
                    letterSpacing: '-0.025em'
                }}>
                    Welcome to AI Studio
                </h2>
                <p style={{
                    color: '#94a3b8',
                    marginBottom: '2.5rem',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                }}>
                    The future of creativity starts here.<br />
                    Sign in to continue.
                </p>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        locale="en"
                        size="large"
                        width="100%"
                    />
                </div>

                <div style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    lineHeight: '1.6',
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    By continuing, you'll be automatically registered if you don't have an account.<br />
                    <span style={{ opacity: 0.7 }}>Safe & Secure Google Authentication</span>
                </div>
            </div>
        </div>
    );
};

export default Login;

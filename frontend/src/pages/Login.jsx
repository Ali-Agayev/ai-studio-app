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
            background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="card" style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '3rem 2.5rem',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '72px',
                    height: '72px',
                    margin: '0 auto 1.5rem',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    border: '3px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff'
                }}>
                    <img src="/favicon.png" alt="AI Studio Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    marginBottom: '0.75rem',
                    color: '#1e293b',
                    letterSpacing: '-0.025em'
                }}>
                    AI Studio
                </h2>
                <p style={{
                    color: '#475569',
                    marginBottom: '2.5rem',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                }}>
                    Professional AI Image Workspace.<br />
                    Please sign in to continue.
                </p>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #fee2e2',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #f1f5f9'
                }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        locale="en"
                        size="large"
                        width="300"
                    />
                </div>

                <div style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    lineHeight: '1.6',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #f1f5f9'
                }}>
                    New users automatically get 1 free credit.<br />
                    <strong style={{ color: '#475569' }}>Secure Google Authentication</strong>
                </div>
            </div>
        </div>
    );
};

export default Login;

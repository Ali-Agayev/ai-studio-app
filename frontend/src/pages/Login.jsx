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
        <div className="auth-container">
            <div className="card">
                <h2 className="text-center" style={{ marginBottom: '1rem' }}>Welcome Back</h2>
                <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Please sign in with your Google account to continue
                </p>

                {error && <div className="error-msg">{error}</div>}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        theme="filled_blue"
                        shape="pill"
                        locale="en"
                    />
                </div>

                <div className="text-center mt-5" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    By signing in, you agree to our Terms and Conditions.
                </div>
            </div>
        </div>
    );
};

export default Login;

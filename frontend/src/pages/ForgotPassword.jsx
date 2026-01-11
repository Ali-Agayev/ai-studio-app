import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await axios.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            // Bir neçə saniyə sonra reset səhifəsinə yönləndir
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error sending reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Forgot Password</h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Enter your email and we'll send you a 6-digit code to reset your password.
                </p>

                {message && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            required
                        />
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" className="link-text">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/auth/reset-password', { email, resetCode, newPassword });
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error resetting password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Reset Password</h2>

                {message && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">6-Digit Reset Code</label>
                        <input
                            type="text"
                            className="form-input"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            placeholder="123456"
                            maxLength="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" className="link-text">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

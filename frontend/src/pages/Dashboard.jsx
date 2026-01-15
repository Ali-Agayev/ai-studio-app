import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [mode, setMode] = useState('generate'); // generate, edit, variation
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [balance, setBalance] = useState(0);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Token ilə headers
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    // Logout funksiyası
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Balansı yüklə
    // İlk yüklənəndə token varsa balansı yoxla
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const fetchProfile = async () => {
                try {
                    const res = await axios.get('/user/me', { headers: getHeaders() });
                    setBalance(res.data.balance);
                    setUser(res.data);
                } catch (err) {
                    console.error("Token invalid", err);
                    // Token xarabdırsa silmirik, bəlkə server xətasıdır. 
                    // Amma 401 olsa çıxış verə bilərik.
                    if (err.response?.status === 401) handleLogout();
                }
            };
            fetchProfile();
        }
    }, []);

    // Stripe ödəniş: göndərilən payload backend-in gözlədiyi formada olmalıdır
    const handleTopUp = async (creditAmount) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Mapping: frontend passes internal credit units (e.g. 100 => 10 images)
        // amountCents must be price in cents that Stripe expects.
        const priceMap = { 10: 10, 100: 99, 500: 399, 1000: 699 };
        const amountCents = priceMap[creditAmount];
        if (!amountCents) {
            alert('Invalid top-up option');
            return;
        }

        try {
            const res = await axios.post('/payment/create-checkout-session', { amountCents, credits: creditAmount }, { headers: getHeaders() });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            alert("Error occurred: " + (err.response?.data?.error || err.message));
        }
    };

    // Uğurlu ödənişdən qayıdan zaman (URL-də ?success=true varsa)
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const success = query.get("success");
        if (success) {
            const demoConfirm = async () => {
                try {
                    const userRes = await axios.get('/user/me', { headers: getHeaders() });
                    // QEYD: Realda bu məlumatı Stripe Webhook-dan almaq daha təhlükəsizdir.
                    // Amma demo üçün URL-dən və ya session-dan təxmini məlumat ala bilərik.
                    // Hal-hazırda sadəcə balansı yeniləmək üçün profil sorğusu atırıq.
                    setBalance(userRes.data.balance);
                    alert("Payment successful! Your balance has been updated. 🎉");
                    window.history.replaceState({}, document.title, "/");
                } catch (e) {
                    console.error(e);
                }
            }
            demoConfirm();
        }
        if (query.get("canceled")) {
            alert("Payment canceled.");
            window.history.replaceState({}, document.title, "/");
        }
    }, [navigate]);

    // Şəkil yaratma / edit / variasiya
    const handleGenerate = async (e) => {
        e.preventDefault();

        // Yoxlama: İstifadəçi giriş edibmi?
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');
        setImageUrl('');

        try {
            const formData = new FormData();

            if (mode === 'generate') {
                const res = await axios.post('/ai/generate', { prompt }, { headers: getHeaders() });
                setImageUrl(res.data.imageUrl);
                setBalance(res.data.remainingBalance);
            } else {
                if (!file) {
                    setError("Please upload an image");
                    setLoading(false);
                    return;
                }
                formData.append('image', file);

                let endpoint = '';
                if (mode === 'edit') {
                    formData.append('prompt', prompt);
                    endpoint = '/ai/edit';
                } else if (mode === 'variation') {
                    endpoint = '/ai/variation';
                }

                const res = await axios.post(endpoint, formData, {
                    headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
                });
                setImageUrl(res.data.imageUrl);
                setBalance(res.data.remainingBalance);
            }

        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--accent-primary)',
                        flexShrink: 0
                    }}>
                        <img src="/favicon.svg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>AI Studio (LIVE)</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {localStorage.getItem('token') && user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logged in as</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>{user.email}</div>
                            </div>
                            <div className="account-badge" style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                padding: '8px 15px',
                                borderRadius: '50px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                                <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{balance} {balance === 1 ? 'Image' : 'Images'}</span>
                            </div>
                            {user.role === 'ADMIN' && (
                                <button onClick={() => navigate('/admin')} className="btn" style={{
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    width: 'auto',
                                    padding: '8px 20px',
                                    fontSize: '0.9rem'
                                }}>Admin Panel</button>
                            )}
                            <button onClick={handleLogout} className="btn" style={{
                                backgroundColor: '#f1f5f9',
                                color: '#475569',
                                width: 'auto',
                                padding: '8px 25px',
                                fontSize: '0.9rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '999px'
                            }}>Logout</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => navigate('/login')} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Login</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="balance-card">
                <h3>Your Balance</h3>
                <div className="balance-amount">{Math.floor(balance / 10)} Images</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={() => handleTopUp(10)} className="btn" style={{ backgroundColor: '#fef3c7', color: '#92400e', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', border: '1px solid #f59e0b' }}>
                        1 Image (TEST - $0.10)
                    </button>
                    <button onClick={() => handleTopUp(100)} className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-primary)', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        10 Images ($0.99)
                    </button>
                    <button onClick={() => handleTopUp(500)} className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-primary)', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        50 Images ($3.99)
                    </button>
                    <button onClick={() => handleTopUp(1000)} className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-primary)', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', border: '2px solid #ffd700' }}>
                        100 Images ($6.99) 🔥
                    </button>
                </div>
            </div>

            <div className="grid-cols-2">
                <div className="card">
                    {/* Mode Switcher */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                        <button
                            className={`btn ${mode === 'generate' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: mode === 'generate' ? 'var(--accent-primary)' : 'transparent', color: mode === 'generate' ? 'white' : 'var(--text-primary)', borderRadius: '999px' }}
                            onClick={() => setMode('generate')}
                        >
                            Generate
                        </button>
                        <button
                            className={`btn ${mode === 'edit' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: mode === 'edit' ? 'var(--accent-primary)' : 'transparent', color: mode === 'edit' ? 'white' : 'var(--text-primary)', borderRadius: '999px' }}
                            onClick={() => setMode('edit')}
                        >
                            Edit
                        </button>
                        <button
                            className={`btn ${mode === 'variation' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: mode === 'variation' ? 'var(--accent-primary)' : 'transparent', color: mode === 'variation' ? 'white' : 'var(--text-primary)', borderRadius: '999px' }}
                            onClick={() => setMode('variation')}
                        >
                            Variation
                        </button>
                    </div>

                    <h2>
                        {mode === 'generate' && "Generate Image"}
                        {mode === 'edit' && "Edit Image"}
                        {mode === 'variation' && "Create Variation"}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {mode === 'generate' && "Describe the image you imagine."}
                        {mode === 'edit' && "Upload an image and describe the part you want to change (PNG + Transparency)."}
                        {mode === 'variation' && "Upload an image to create similar variations."}
                        <br />Price: 1 Image
                    </p>

                    <form onSubmit={handleGenerate}>

                        {(mode === 'edit' || mode === 'variation') && (
                            <div className="form-group">
                                <label className="form-label">Upload Image</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="btn btn-outline" style={{ cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                                        {file ? 'Change image' : 'Choose Image File'}
                                        <input
                                            type="file"
                                            accept="image/png"
                                            style={{ display: 'none' }}
                                            onChange={(e) => setFile(e.target.files[0])}
                                            required={!file}
                                        />
                                    </label>
                                    {file && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--success)', textAlign: 'center' }}>
                                            Selected: {file.name}
                                        </div>
                                    )}
                                </div>
                                <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>PNG format, max 4MB</small>
                            </div>
                        )}

                        {mode !== 'variation' && (
                            <div className="form-group">
                                <label className="form-label">Description (Prompt)</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    placeholder={mode === 'edit' ? "Ex: Add a hat to the cat..." : "Ex: Red car flying in space..."}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        )}

                        {error && <div className="error-msg">{error}</div>}

                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Processing...' : 'Start ✨'}
                        </button>
                    </form>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎨</div>
                            <div>Magic is happening...</div>
                        </div>
                    ) : imageUrl ? (
                        <div className="generated-image">
                            <img src={imageUrl} alt="Generated AI" />
                            <a href={imageUrl} target="_blank" rel="noreferrer" className="link-text" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
                                View Full Size
                            </a>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🖼️</div>
                            <div>Nothing generated yet</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

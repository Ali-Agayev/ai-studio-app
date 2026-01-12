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

    // Stripe/Payriff Ödəniş
    const handleTopUp = async (creditAmount) => {
        // Yoxlama: İstifadəçi giriş edibmi?
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.post('/payment/create-checkout-session', { amount: creditAmount }, { headers: getHeaders() });
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            alert("Xəta baş verdi: " + (err.response?.data?.error || err.message));
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
                    alert("Ödəniş uğurludur! Balansınız yeniləndi. 🎉");
                    window.history.replaceState({}, document.title, "/");
                } catch (e) {
                    console.error(e);
                }
            }
            demoConfirm();
        }
        if (query.get("canceled")) {
            alert("Ödəniş ləğv edildi.");
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
                    setError("Zəhmət olmasa şəkil yükləyin");
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
            setError(err.response?.data?.error || 'Xəta baş verdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="header">
                <h1>AI Studio</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {localStorage.getItem('token') && user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daxil olub</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>{user.email}</div>
                            </div>
                            <div className="account-badge" style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                padding: '8px 15px',
                                borderRadius: '12px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                                <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{Math.floor(balance / 10)} Şəkil</span>
                            </div>
                            <button onClick={handleLogout} className="btn" style={{
                                backgroundColor: '#334155',
                                width: 'auto',
                                padding: '8px 15px',
                                fontSize: '0.9rem'
                            }}>Çıxış</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => navigate('/login')} className="btn">Google ilə Giriş</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="balance-card">
                <h3>Balansınız</h3>
                <div className="balance-amount">{Math.floor(balance / 10)} Şəkil</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={() => handleTopUp(100)} className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-primary)', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        10 Şəkil (0.99 AZN)
                    </button>
                    <button onClick={() => handleTopUp(500)} className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-primary)', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        50 Şəkil (3.99 AZN)
                    </button>
                    <button onClick={() => handleTopUp(1000)} className="btn" style={{ backgroundColor: 'white', color: 'var(--accent-primary)', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', border: '2px solid #ffd700' }}>
                        100 Şəkil (6.99 AZN) 🔥
                    </button>
                </div>
            </div>

            <div className="grid-cols-2">
                <div className="card">
                    {/* Mode Switcher */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                        <button
                            className={`btn ${mode === 'generate' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: mode === 'generate' ? 'var(--accent-primary)' : 'transparent', color: mode === 'generate' ? 'white' : 'var(--text-primary)' }}
                            onClick={() => setMode('generate')}
                        >
                            Yarat
                        </button>
                        <button
                            className={`btn ${mode === 'edit' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: mode === 'edit' ? 'var(--accent-primary)' : 'transparent', color: mode === 'edit' ? 'white' : 'var(--text-primary)' }}
                            onClick={() => setMode('edit')}
                        >
                            Düzəliş
                        </button>
                        <button
                            className={`btn ${mode === 'variation' ? '' : 'btn-outline'}`}
                            style={{ flex: 1, backgroundColor: mode === 'variation' ? 'var(--accent-primary)' : 'transparent', color: mode === 'variation' ? 'white' : 'var(--text-primary)' }}
                            onClick={() => setMode('variation')}
                        >
                            Variasiya
                        </button>
                    </div>

                    <h2>
                        {mode === 'generate' && "Şəkil Yarat"}
                        {mode === 'edit' && "Şəkilə Düzəliş"}
                        {mode === 'variation' && "Variasiya Yarat"}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {mode === 'generate' && "Xəyalınızdakı şəkli təsvir edin."}
                        {mode === 'edit' && "Şəkil yükləyin və dəyişmək istədiyiniz hissəni təsvir edin."}
                        {mode === 'variation' && "Bənzər variasiyalar yaratmaq üçün şəkil yükləyin."}
                        <br />Qiymət: 1 Şəkil
                    </p>

                    <form onSubmit={handleGenerate}>

                        {(mode === 'edit' || mode === 'variation') && (
                            <div className="form-group">
                                <label className="form-label">Şəkil Yüklə</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="btn btn-outline" style={{ cursor: 'pointer', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                                        {file ? 'Şəkli dəyiş' : 'Şəkil faylı seçin'}
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
                                            Seçildi: {file.name}
                                        </div>
                                    )}
                                </div>
                                <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>PNG format, max 4MB</small>
                            </div>
                        )}

                        {mode !== 'variation' && (
                            <div className="form-group">
                                <label className="form-label">Təsvir (Prompt)</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    placeholder={mode === 'edit' ? "Misal: Pişiyə papaq əlavə et..." : "Misal: Kosmosda uçan qırmızı maşın..."}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        )}

                        {error && <div className="error-msg">{error}</div>}

                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'İşlənilir...' : 'Başla ✨'}
                        </button>
                    </form>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎨</div>
                            <div>Möcüzə baş verir...</div>
                        </div>
                    ) : imageUrl ? (
                        <div className="generated-image">
                            <img src={imageUrl} alt="Generated AI" />
                            <a href={imageUrl} target="_blank" rel="noreferrer" className="link-text" style={{ display: 'block', marginTop: '1rem', textAlign: 'center' }}>
                                Tam ölçüdə bax
                            </a>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🖼️</div>
                            <div>Hələ heç nə yaradılmayıb</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

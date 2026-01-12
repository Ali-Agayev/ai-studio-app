import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return { Authorization: `Bearer ${token}` };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, statsRes, adminRes] = await Promise.all([
                    axios.get('/admin/users', { headers: getHeaders() }),
                    axios.get('/admin/stats', { headers: getHeaders() }),
                    axios.get('/user/me', { headers: getHeaders() })
                ]);
                setUsers(usersRes.data);
                setStats(statsRes.data);
                setAdminProfile(adminRes.data);
            } catch (err) {
                console.error("Admin fetch error:", err);
                if (err.response?.status === 403) {
                    setError("Daxil olmaq üçün admin üstünlüyünüz yoxdur.");
                } else {
                    setError("Məlumatları yükləmək mümkün olmadı.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9' }}>
            <div style={{ color: '#475569', fontSize: '1.2rem' }}>Admin Panel yüklənir...</div>
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f1f5f9', flexDirection: 'column', gap: '20px' }}>
            <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>{error}</div>
            <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: '10px 20px' }}>Dashboard-a qayıt</button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>A</div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>Admin Panel</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {adminProfile && (
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
                                <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{adminProfile.balance} Credits</span>
                            </div>
                        )}
                        <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: '10px 20px', backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1' }}>Ana Səhifə</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cəmi İstifadəçi</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>{stats?.totalUsers}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ümumi Balans (Kredit)</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4f46e5' }}>{stats?.totalCredits}</div>
                    </div>
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Cəmi Satış (Uğurlu)</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{stats?.totalSales}</div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>İstifadəçilər</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Email</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Balans</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Rol</th>
                                    <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600' }}>Qeydiyyat Tarixi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{u.email}</td>
                                        <td style={{ padding: '1rem' }}>{u.balance}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '99px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                background: u.role === 'ADMIN' ? '#dcfce7' : '#f1f5f9',
                                                color: u.role === 'ADMIN' ? '#166534' : '#475569'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;

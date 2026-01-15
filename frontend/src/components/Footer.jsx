import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '2rem 1rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.9rem'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '2rem',
                marginBottom: '1rem'
            }}>
                <Link to="/features" style={linkStyle}>Features</Link>
                <Link to="/contact" style={linkStyle}>Contact</Link>
                <Link to="/terms" style={linkStyle}>Terms of Service</Link>
                <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>
                <Link to="/refund" style={linkStyle}>Refund Policy</Link>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
                <strong>AI Studio</strong> &copy; {new Date().getFullYear()}
            </div>
            <div>
                Built for creators.
            </div>
        </footer>
    );
};

const linkStyle = {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s',
};

export default Footer;

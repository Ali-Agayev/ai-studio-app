import React from 'react';
import Footer from '../components/Footer';

const PageLayout = ({ title, children }) => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <div style={{
            maxWidth: '800px',
            margin: '40px auto',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '90%'
        }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <a href="/" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem' }}>&larr; Back to Home</a>
            </div>
            <h1 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '1.5rem' }}>{title}</h1>
            <div style={{ lineHeight: '1.8', color: '#334155' }}>
                {children}
            </div>
        </div>
        <Footer />
    </div>
);

export const Features = () => (
    <PageLayout title="Features">
        <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={featureItemStyle}>
                <span style={iconStyle}>🎨</span>
                <strong>AI Image Generation:</strong> Create stunning visuals from text descriptions in seconds.
            </li>
            <li style={featureItemStyle}>
                <span style={iconStyle}>⚡</span>
                <strong>Fast Results:</strong> Powered by high-performance GPUs for near-instant generation.
            </li>
            <li style={featureItemStyle}>
                <span style={iconStyle}>🔌</span>
                <strong>API Support:</strong> Integrate our powerful image generation engine into your own applications.
            </li>
            <li style={featureItemStyle}>
                <span style={iconStyle}>🔒</span>
                <strong>Secure Payments:</strong> Transactions processed safely via Paddle.
            </li>
        </ul>
    </PageLayout>
);

export const Contact = () => (
    <PageLayout title="Contact Us">
        <p>We are here to help! If you have any questions, concerns, or feedback, please reach out to us.</p>

        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
            <h3 style={{ marginTop: 0 }}>Support</h3>
            <p>Email: <a href="mailto:support@ai-image-generation.app" style={{ color: '#3b82f6' }}>support@ai-image-generation.app</a></p>
        </div>

        <div style={{ marginTop: '2rem' }}>
            <h3>Company Address</h3>
            <p>
                <strong>AI Image Generation Inc.</strong><br />
                123 AI Boulevard, Tech City<br />
                Digital Nation
            </p>
        </div>
    </PageLayout>
);

export const Terms = () => (
    <PageLayout title="Terms of Service">
        <p>Last updated: January 2026</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using AI Image Generation, you agree to be bound by these Terms of Service.</p>

        <h3>2. Usage of Services</h3>
        <p>You agree to use our services only for lawful purposes. You may not use the platform to generate illegal or harmful content.</p>

        <h3>3. Credits & Payments</h3>
        <p>Credits are purchased via Paddle. All purchases are final unless otherwise stated in the Refund Policy.</p>
    </PageLayout>
);

export const Privacy = () => (
    <PageLayout title="Privacy Policy">
        <p>Last updated: January 2026</p>
        <p>Your privacy is important to us. This policy explains how we handle your data.</p>

        <h3>1. Information We Collect</h3>
        <p>We collect your email address for account management and transaction history for payments.</p>

        <h3>2. How We Use Your Data</h3>
        <p>We use your data solely to provide and improve our services. We do not sell your personal data.</p>
    </PageLayout>
);

export const Refund = () => (
    <PageLayout title="Refund Policy">
        <p>Last updated: January 2026</p>
        <p>We strive to ensure satisfaction with our services.</p>

        <h3>Refund Eligibility</h3>
        <ul>
            <li>Refunds for credit purchases may be requested within 14 days of purchase if the credits have not been used.</li>
            <li>Once credits are used to generate images, the purchase is non-refundable.</li>
        </ul>
        <p>To request a refund, please contact us at <a href="mailto:support@ai-image-generation.app">support@ai-image-generation.app</a>.</p>
    </PageLayout>
);

const featureItemStyle = {
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1.1rem'
};

const iconStyle = {
    fontSize: '1.5rem'
};

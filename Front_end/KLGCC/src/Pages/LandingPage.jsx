import { useState } from 'react';
import { useAuth } from '../API Contexts Folder/AuthContext';
import { useNavigate } from "react-router-dom";
import nikaLogo from '../assets/nikafleet-logo.png';
import "./Pages CSS files/Login.css";

const LandingPage = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [full_name, setFullName] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('login');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if ((activeTab === 'login' && (!email || !password)) ||
            (activeTab === 'signup' && (!full_name || !email || !phone_number || !password))) {
            setError('Please fill in all fields');
            return;
        }

        let result;
        try {
            if (activeTab === 'login') {
                result = await login(email, password);
            } else {
                result = await register(full_name, email, phone_number, password);
            }

            if (
                result.data.message === "Staff login successful" ||
                result.data.message === "Customer login successful" ||
                result.data.message === "Staff registered successfully" ||
                result.data.message === "Customer registered successfully"
            ) {
                navigate("/dashboard");
            } else {
                setError(result.data.message || `${activeTab === 'login' ? 'Login' : 'Sign up'} failed. Please try again.`);
            }
        } catch (err) {
            setError(err.response?.data?.message || `${activeTab === 'login' ? 'Login' : 'Sign up'} failed. Please try again.`);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="glass-highlight" />

                {/* Logo */}
                <div className="login-logo-box">
                    <img src={nikaLogo} alt="Nika Fleet Logo" />
                </div>

                <h2 className="club-title">Nika Fleet</h2>
                <p className="club-subtitle">Affordable wheels, unlimited moments</p>

                {/* Tabs */}
                <div className="tab-buttons">
                    <button className={`tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Log in</button>
                    <button className={`tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>Sign up</button>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

                    {activeTab === 'signup' && (
                        <>
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your full name" value={full_name} onChange={(e) => setFullName(e.target.value)} />

                            <label>Phone Number</label>
                            <input type="number" placeholder="Enter your phone number" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </>
                    )}

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="login-btn">
                        {activeTab === 'login' ? 'Log in' : 'Sign up'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LandingPage;
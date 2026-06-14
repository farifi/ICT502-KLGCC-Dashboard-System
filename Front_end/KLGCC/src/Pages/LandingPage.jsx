import { useState } from 'react';
import { useAuth } from '../API Contexts Folder/AuthContext';
import { useNavigate } from "react-router-dom"; 
import { Link } from "react-router-dom";
import bgImage from '../assets/golfBG.jpg';
import logo from '../assets/logo_klgcc_black.png';

import "./Pages CSS files/Login.css";

const LandingPage = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [full_name, setFullName] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('')
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('login')

    const handleSubmit = async(event) => {
        event.preventDefault();
        setError('')

        if ((activeTab === 'login' && (!email || !password)) || (activeTab === 'signup' && (!full_name || !email || !phone_number || !password))) {
            setError('Please fill in all fields');            
            return;
        }
        
        let result;
        try {
            if (activeTab === 'login'){
                result = await login(email, password);
            } else {
                result = await register(full_name, email, phone_number, password);
            }

            if (result.data.message === "Staff login successful" || result.data.message === "Customer login successful"){
                navigate("/dashboard");
            } else if (result.data.message === "Staff registered successfully" || result.data.message === "Customer registered successfully") {
                navigate("/dashboard");
            } else {
                setError(result.data.message || `${activeTab === 'login' ? 'Login' : 'Sign up' } failed. Please try again.`);      
            }

        } catch (err) {
            setError(err.response?.data?.message || `${activeTab === 'login' ? 'Login' : 'Sign up' } failed. Please try again.`);      
        }
    };

    return (
        <div className="login-page" style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: 'fixed' }}>
            <div className="login-card">
                <div className="glass-highlight" />
                <div className="login-logo-box">
                    <img src={logo} alt="Kuala Lumpur Golf & Country Club Logo" />
                </div>

                <h2 className="club-title">KLGCC</h2>
                <p className="club-subtitle">Kuala Lumpur Golf & Country Club</p>

                <div className="tab-buttons">
                    <button className={`tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Log in</button>
                    <button className={`tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>Sign up</button>
                </div>
                
                <form className={`login-form ${activeTab}-form`} onSubmit={handleSubmit}>
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                
                    {activeTab === 'signup' && (
                        <>
                        <label>Confirm Password</label>
                        <input type="password" placeholder="Confirm your password" />

                        <label>Full Name</label>
                        <input type="username" placeholder="Enter your full name " value={full_name} onChange={(e) => setFullName(e.target.value)} />
                        
                        <label>Phone Number</label>
                        <input type="number" placeholder="Enter your phone number" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </>
                    )}
                    {error && <p className="error">{error}</p>}
                    <button type="submit" className="login-btn">
                        {activeTab === 'login' ? 'Log in' : 'Sign up'}
                        </button>
                </form>
            </div>
            
        </div>
    );
};

export default LandingPage;

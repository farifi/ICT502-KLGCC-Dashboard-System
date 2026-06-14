import {createContext, useContext, useState, useEffect } from "react";
import API, { setAccessToken } from "../Api.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });
    const [authLoading, setAuthLoading] = useState(true);

    // On initial load, ask backend if there is a valid session
    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        // No saved session → skip backend check
        if (!savedUser) {
            setAuthLoading(false);
            return;
        }

        const checkSession = async () => {
            try {
                const res = await API.get("/api/auth/protected");
                if (res.data?.user) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                } else {
                setUser(null);
                localStorage.removeItem("user");
                }
            } catch {
                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setAuthLoading(false);
            }
        };

        checkSession();
    }, []);

    const register = async (full_name, email, phone_number, password) => {
        try {
            const res = await API.post('/api/auth/signup', { full_name, email, phone_number, password });
            alert(res.data.message || "Registered successfully");
            console.log(res.data);
            return res;
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed");
            return err.response?.data?.message;
        }
    };

    const login = async (email, password) => {
        try{
            const res = await API.post("/api/auth/login", { email, password });
            // Backend returns user info and tokens in res.data
            const userData  = res.data.user;
            const accessToken = res.data.accessToken;

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));  
            setAccessToken(accessToken);
            return res;
        } catch  (err) {
            alert(err.response?.data?.message || "Invalid email or password");
            return err.response?.data?.message;
        }
    };

    const logout = async () => {
        try {
            await API.post("/api/auth/logout");
        } catch (err) {
            // even if backend fails, clear local auth state
            console.error("Logout error:", err);
        } finally {
            setUser(null);
            localStorage.removeItem("user");
            setAccessToken(null);
            console.log("Logged out successfully!");
            alert("Logged out successfully!");
        }
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside an AuthProvider");
    return context;
};


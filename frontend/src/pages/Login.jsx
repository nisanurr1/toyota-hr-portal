import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Önceki oturum bilgilerini tamamen temizle
            localStorage.clear();

            const response = await api.post("/auth/login", { email, password });
            const data = response.data;

            console.log("Login Sunucu Yanıtı:", data);

            // Token ve Rol
            localStorage.setItem("token", data.token || "mock-token");
            localStorage.setItem("role", data.role || "EMPLOYEE");

            // Kullanıcı ID'si
            const activeUserId = data.userId || data.id;
            localStorage.setItem("userId", String(activeUserId));

            // İsim Soyisim (Sabit varsayılan kaldırıldı)
            const name = data.name || "";
            const surname = data.surname || "";
            const fullName = `${name} ${surname}`.trim() || "Kullanıcı";
            localStorage.setItem("fullName", fullName);

            navigate("/dashboard");
        } catch (err) {
            console.error("Giriş Hatası:", err);
            setError(err.response?.data || "E-posta veya şifre hatalı!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.brandContainer}>
                    <h1 style={styles.title}>TOYOTA</h1>
                    <span style={styles.subtitle}>HR Portal</span>
                </div>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>E-Posta Adresi</label>
                        <input
                            type="email"
                            placeholder="ornek@toyota.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Şifre</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f4f4f4",
    },
    card: {
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        boxSizing: "border-box",
    },
    brandContainer: {
        textAlign: "center",
        marginBottom: "30px",
    },
    title: {
        margin: "0",
        color: "#d6001c",
        fontSize: "32px",
        letterSpacing: "2px",
    },
    subtitle: {
        color: "#555",
        fontSize: "14px",
        fontWeight: "bold",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        gap: "6px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#333",
    },
    input: {
        padding: "12px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "14px",
        outline: "none",
    },
    button: {
        padding: "12px",
        background: "#d6001c",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "15px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background 0.2s",
    },
    errorMessage: {
        padding: "10px",
        background: "#ffebee",
        color: "#c62828",
        borderRadius: "4px",
        fontSize: "13px",
        marginBottom: "15px",
        textAlign: "center",
    }
};

export default Login;
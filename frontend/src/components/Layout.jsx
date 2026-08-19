import { useNavigate, Link, useLocation } from "react-router-dom";

function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const fullName = localStorage.getItem("fullName") || "Kullanıcı";
    const role = localStorage.getItem("role") || "EMPLOYEE";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Tüm olası menü elemanları
    const allMenuItems = [
        {
            path: "/dashboard",
            label: "Gösterge Paneli",
            allowedRoles: ["EMPLOYEE", "MANAGER", "HR", "ADMIN"]
        },
        {
            path: "/hr",
            label: "HR Yönetim Paneli",
            allowedRoles: ["HR", "ADMIN"]
        },
        {
            path: "/manager",
            label: "Yönetici Paneli",
            allowedRoles: ["MANAGER"]
        },
        {
            path: "/leave-requests",
            label: "İzin Talepleri",
            allowedRoles: ["EMPLOYEE"]
        },
        {
            path: "/vehicle-requests",
            label: "Araç Talepleri",
            allowedRoles: ["EMPLOYEE"]
        },
        {
            path: "/vehicle-management",
            label: "Filo Yönetimi",
            allowedRoles: ["HR", "ADMIN"]
        },
        {
            path: "/update-requests",
            label: "Profil Güncellemeleri",
            allowedRoles: ["EMPLOYEE"]
        },
        {
            path: "/notifications",
            label: "Bildirimler",
            allowedRoles: ["EMPLOYEE", "MANAGER", "HR", "ADMIN"]
        },
    ];

    // Giriş yapan kullanıcının rolüne göre menü öğelerini filtreleme
    const menuItems = allMenuItems.filter(item => item.allowedRoles.includes(role));

    return (
        <div style={styles.appContainer}>
            {/* Sol Menü (Sidebar) */}
            <aside style={styles.sidebar}>
                <div style={styles.brand}>
                    <h2 style={styles.brandTitle}>TOYOTA</h2>
                    <span style={styles.brandSubtitle}>HR PORTAL</span>
                </div>

                <nav style={styles.nav}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...styles.navItem,
                                    ...(isActive ? styles.navItemActive : {}),
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={styles.sidebarFooter}>
                    <span style={styles.version}>v1.0.0</span>
                </div>
            </aside>

            {/* Ana İçerik Alanı */}
            <div style={styles.mainWrapper}>
                {/* Üst Bar (Header) */}
                <header style={styles.header}>
                    <div style={styles.headerTitle}>
                        İnsan Kaynakları Yönetim Sistemi
                    </div>

                    <div style={styles.userInfo}>
                        <div style={styles.userDetails}>
                            <span style={styles.userName}>{fullName}</span>
                            <span style={styles.userRole}>{role}</span>
                        </div>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Çıkış Yap
                        </button>
                    </div>
                </header>

                {/* Sayfa İçerikleri */}
                <main style={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}

const styles = {
    appContainer: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
    },
    sidebar: {
        width: "250px",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
    },
    brand: {
        padding: "24px 20px",
        borderBottom: "1px solid #2d2d2d",
        textAlign: "left",
    },
    brandTitle: {
        margin: 0,
        color: "#d6001c",
        fontSize: "24px",
        letterSpacing: "2px",
        fontWeight: "bold",
    },
    brandSubtitle: {
        fontSize: "11px",
        color: "#aaa",
        letterSpacing: "1px",
        fontWeight: "600",
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        flexGrow: 1,
    },
    navItem: {
        padding: "14px 24px",
        color: "#bbb",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.2s",
        borderLeft: "4px solid transparent", // Varsayılan kenarlık
        textAlign: "left",
    },
    navItemActive: {
        color: "#fff",
        backgroundColor: "#262626",
        borderLeft: "4px solid #d6001c", // borderLeftColor yerine doğrudan borderLeft kullandık
        fontWeight: "600",
    },
    sidebarFooter: {
        padding: "20px",
        borderTop: "1px solid #2d2d2d",
        fontSize: "12px",
        color: "#666",
        textAlign: "center",
    },
    mainWrapper: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
    },
    header: {
        height: "65px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    },
    headerTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#333",
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    userDetails: {
        display: "flex",
        flexDirection: "column",
        textAlign: "right",
    },
    userName: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#222",
    },
    userRole: {
        fontSize: "11px",
        color: "#d6001c",
        fontWeight: "bold",
    },
    logoutBtn: {
        padding: "8px 16px",
        backgroundColor: "#fff",
        border: "1px solid #d6001c",
        color: "#d6001c",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        transition: "all 0.2s",
    },
    content: {
        padding: "30px",
        flexGrow: 1,
    },
};

export default Layout;
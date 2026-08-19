import { useState, useEffect } from "react";
import api from "../services/api";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get("/notifications");
                setNotifications(response.data);
            } catch (err) {
                console.error("Bildirimler çekilemedi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Bildirimler & Duyurular</h1>
                <p style={styles.subtitle}>İnsan kaynakları ve şirket içi güncel bildirimleriniz.</p>
            </div>

            <div style={styles.listContainer}>
                {loading ? (
                    <p>Yükleniyor...</p>
                ) : notifications.length === 0 ? (
                    <div style={styles.emptyCard}>
                        <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔔</div>
                        <h3>Henüz Bildiriminiz Yok</h3>
                        <p style={{ color: "#777", fontSize: "14px" }}>
                            Yeni bir duyuru veya izin/araç talebi yanıtı geldiğinde burada görüntülenecektir.
                        </p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div key={item.id} style={styles.notificationCard}>
                            <div style={styles.cardHeader}>
                                <span style={styles.icon}>📢</span>
                                <div>
                                    <h4 style={styles.cardTitle}>{item.title || "Sistem Bildirimi"}</h4>
                                    <span style={styles.date}>{item.createdDate || "Bugün"}</span>
                                </div>
                            </div>
                            <p style={styles.message}>{item.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: "flex", flexDirection: "column", gap: "20px" },
    header: { textAlign: "left" },
    title: { margin: "0 0 4px 0", fontSize: "24px", color: "#222" },
    subtitle: { margin: 0, fontSize: "14px", color: "#666" },
    listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
    emptyCard: { backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.04)", textAlign: "center" },
    notificationCard: { backgroundColor: "#fff", padding: "18px 24px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.04)", borderLeft: "4px solid #d6001c", textAlign: "left" },
    cardHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" },
    icon: { fontSize: "20px", backgroundColor: "#f8f9fa", padding: "8px", borderRadius: "50%" },
    cardTitle: { margin: 0, fontSize: "15px", color: "#222" },
    date: { fontSize: "12px", color: "#888" },
    message: { margin: 0, fontSize: "14px", color: "#555", lineHeight: "1.5" },
};

export default Notifications;
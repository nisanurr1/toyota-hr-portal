import { useState, useEffect } from "react";
import api from "../services/api";

const BRAND_RED = "#d6001c";

const STATUS_STYLES = {
    PENDING: { label: "Beklemede", bg: "#fff3cd", color: "#8a6100" },
    APPROVED: { label: "Onaylandı", bg: "#e6f4ea", color: "#1e7e34" },
    REJECTED: { label: "Reddedildi", bg: "#ffebee", color: "#c62828" },
};

function VehicleRequest() {
    const [requests, setRequests] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const getCurrentUserId = () => {
        const localUserId = localStorage.getItem("userId") || localStorage.getItem("authUserId");
        const sessionUserId = sessionStorage.getItem("userId") || sessionStorage.getItem("authUserId");
        return localUserId || sessionUserId || "1";
    };

    const currentUserId = getCurrentUserId();

    // Form State
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [usageDate, setUsageDate] = useState("");
    const [purpose, setPurpose] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Araç Taleplerini Çekme (Sadece giriş yapan kullanıcı için)
    const fetchVehicleRequests = async () => {
        setLoading(true);
        setError("");
        try {
            // Doğrudan backend'den tüm talepleri çekip filtrelemeden basarak kontrol edelim
            const response = await api.get("/vehicle-requests");
            const allData = Array.isArray(response.data) ? response.data : [];
            
            console.log("Gelen tüm talepler:", allData); // Konsoldan gelen verinin yapısını görebilirsin
            setRequests(allData); // Eğer herkesin talebini bu ekranda görebiliyorsan sorun ID eşleşmesindedir.
        } catch (err) {
            setError("Araç talepleri yüklenirken bir hata oluştu.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Sistemdeki Araçları Çekme (Dropdown için)
    const fetchVehicles = async () => {
        try {
            const response = await api.get("/vehicles");
            const allVehicles = Array.isArray(response.data) ? response.data : [];
            // Sadece müsait araçları listele
            const availableVehicles = allVehicles.filter(v => v.available !== false);
            setVehicles(availableVehicles);
            
            if (availableVehicles.length > 0) {
                setSelectedVehicleId(availableVehicles[0].id);
            }
        } catch (err) {
            console.error("Araç listesi çekilemedi:", err);
        }
    };

    useEffect(() => {
        fetchVehicles();
        fetchVehicleRequests();
    }, [currentUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!selectedVehicleId) {
            setFormError("Lütfen bir araç seçiniz.");
            return;
        }

        if (!usageDate) {
            setFormError("Lütfen kullanım tarihini seçiniz.");
            return;
        }

        if (new Date(usageDate) < new Date(new Date().setHours(0,0,0,0))) {
            setFormError("Kullanım tarihi geçmiş bir tarih olamaz.");
            return;
        }

        if (!purpose || purpose.trim().length === 0) {
            setFormError("Lütfen kullanım amacını açıklayınız.");
            return;
        }

        setSubmitting(true);

        try {
            // Backend'deki VehicleRequest entity'sine uygun payload
            const requestData = {
                requestDate: new Date().toISOString().split("T")[0],
                usageDate: usageDate,
                purpose: purpose.trim(),
                status: "PENDING",
                user: { id: parseInt(currentUserId, 10) },
                vehicle: { id: parseInt(selectedVehicleId, 10) }
            };

            const response = await api.post("/vehicle-requests", requestData);
            
            if (response.status === 200 || response.status === 201) {
                setShowModal(false);
                setUsageDate("");
                setPurpose("");
                if (vehicles.length > 0) setSelectedVehicleId(vehicles[0].id);

                await fetchVehicleRequests();
            }
        } catch (err) {
            console.error("Araç talebi hatası:", err);
            setFormError(err.response?.data?.message || "Araç talebi gönderilirken bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    // İstatistikler
    const approvedCount = requests.filter(r => r.status === "APPROVED" || r.status === "MANAGER_APPROVED").length;
    const pendingCount = requests.filter(r => r.status === "PENDING").length;
    const rejectedCount = requests.filter(r => r.status === "REJECTED" || r.status === "MANAGER_REJECTED").length;

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.brandContainer}>
                    <h1 style={styles.title}>TOYOTA</h1>
                    <span style={styles.subtitle}>HR Portal</span>
                </div>
            </header>

            <main style={styles.container}>
                <div style={styles.pageHeaderRow}>
                    <div>
                        <h2 style={styles.pageTitle}>Araç Talepleri</h2>
                        <p style={styles.pageSubtitle}>Şirket içi görevleriniz için havuz aracı talebinde bulunun ve durumunu takip edin.</p>
                    </div>
                    <button style={styles.button} onClick={() => setShowModal(true)}>
                        + Yeni Araç Talebi
                    </button>
                </div>

                {/* ÖZET KARTLARI */}
                <div style={styles.summaryRow}>
                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#0288d1" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{requests.length}</span>
                            <span style={styles.summaryLabel}>TOPLAM TALEP</span>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#1e7e34" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{approvedCount}</span>
                            <span style={styles.summaryLabel}>ONAYLANAN</span>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#8a6100" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{pendingCount}</span>
                            <span style={styles.summaryLabel}>BEKLEYEN</span>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#c62828" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{rejectedCount}</span>
                            <span style={styles.summaryLabel}>REDDEDİLEN</span>
                        </div>
                    </div>
                </div>

                {/* ARAÇ TALEPLERİ TABLOSU */}
                <h3 style={styles.sectionTitle}>Talep Geçmişi</h3>
                <div style={styles.card}>
                    {error && <div style={styles.errorMessage}>{error}</div>}

                    {loading ? (
                        <div style={styles.emptyState}>Yükleniyor...</div>
                    ) : requests.length === 0 ? (
                        <div style={styles.emptyState}>Henüz oluşturulmuş bir araç talebiniz bulunmuyor.</div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>Kullanım Tarihi</th>
                                <th style={styles.th}>Talep Tarihi</th>
                                <th style={styles.th}>Araç Bilgisi</th>
                                <th style={styles.th}>Görev / Amaç</th>
                                <th style={styles.th}>Durum</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((r) => {
                                // Status kontrolü (Yönetici onaylı vs standart onay)
                                let currentStatus = "PENDING";
                                if (r.status?.includes("APPROVED")) currentStatus = "APPROVED";
                                else if (r.status?.includes("REJECTED")) currentStatus = "REJECTED";
                                
                                const status = STATUS_STYLES[currentStatus] || STATUS_STYLES.PENDING;
                                const vehicleName = r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : "Belirtilmemiş";
                                
                                return (
                                    <tr key={r.id}>
                                        <td style={{ ...styles.td, fontWeight: "bold" }}>{r.usageDate}</td>
                                        <td style={styles.td}>{r.requestDate}</td>
                                        <td style={styles.td}>{vehicleName}</td>
                                        <td style={styles.td}>{r.purpose}</td>
                                        <td style={styles.td}>
                                                <span
                                                    style={{
                                                        ...styles.badge,
                                                        background: status.bg,
                                                        color: status.color,
                                                    }}
                                                >
                                                    {status.label}
                                                </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* MODAL: YENİ ARAÇ TALEBİ */}
            {showModal && (
                <div style={styles.overlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Yeni Araç Talebi</h3>
                            <button style={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
                        </div>

                        {formError && <div style={styles.errorMessage}>{formError}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Araç Seçimi *</label>
                                <select
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    style={styles.input}
                                    required
                                >
                                    {vehicles.length === 0 && <option value="">Müsait araç bulunamadı</option>}
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.brand} {v.model} ({v.year}) - {v.fuelType}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Kullanım Tarihi *</label>
                                <input
                                    type="date"
                                    required
                                    value={usageDate}
                                    onChange={(e) => setUsageDate(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Kullanım Amacı / Görev Açıklaması *</label>
                                <textarea
                                    placeholder="Aracı hangi iş/görev için talep ettiğinizi detaylandırınız..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    style={{ ...styles.input, resize: "vertical", minHeight: "80px" }}
                                    required
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelButton} onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" disabled={submitting} style={styles.button}>
                                    {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Stiller LeaveRequest.jsx ile birebir aynıdır, bütünlüğü korur.
const styles = {
    page: { minHeight: "100vh", background: "#f4f4f4" },
    header: { background: "#ffffff", borderBottom: `3px solid ${BRAND_RED}`, padding: "16px 32px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
    brandContainer: { display: "flex", alignItems: "baseline", gap: "10px" },
    title: { margin: "0", color: BRAND_RED, fontSize: "24px", letterSpacing: "2px" },
    subtitle: { color: "#555", fontSize: "13px", fontWeight: "bold" },
    container: { maxWidth: "960px", margin: "0 auto", padding: "32px 24px", boxSizing: "border-box" },
    pageHeaderRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "wrap" },
    pageTitle: { margin: "0 0 4px 0", fontSize: "22px", color: "#222", fontWeight: "bold" },
    pageSubtitle: { margin: 0, fontSize: "13px", color: "#666" },
    summaryRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "28px" },
    summaryCard: { display: "flex", alignItems: "stretch", background: "#ffffff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", overflow: "hidden" },
    summaryAccent: { width: "4px", flexShrink: 0 },
    cardInnerContent: { display: "flex", flexDirection: "column", padding: "16px", gap: "4px", width: "100%" },
    summaryLabel: { fontSize: "11px", color: "#666", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" },
    cardValue: { fontSize: "22px", fontWeight: "bold", color: "#222" },
    sectionTitle: { margin: "0 0 12px 0", fontSize: "15px", color: "#333", fontWeight: "700" },
    card: { background: "#ffffff", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", padding: "8px", boxSizing: "border-box", overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
    th: { textAlign: "left", padding: "14px 16px", color: "#ffffff", backgroundColor: BRAND_RED, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "none" },
    td: { padding: "14px 16px", borderBottom: "1px solid #eee", color: "#333" },
    badge: { display: "inline-block", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
    emptyState: { padding: "40px 16px", textAlign: "center", color: "#888", fontSize: "14px" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 },
    modal: { width: "100%", maxWidth: "460px", background: "#ffffff", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", padding: "28px", boxSizing: "border-box" },
    modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
    modalTitle: { margin: 0, fontSize: "18px", color: "#222", fontWeight: "bold" },
    closeButton: { border: "none", background: "transparent", fontSize: "22px", lineHeight: 1, color: "#888", cursor: "pointer", padding: "0 4px" },
    form: { display: "flex", flexDirection: "column", gap: "18px" },
    inputGroup: { display: "flex", flexDirection: "column", textAlign: "left", gap: "6px", flex: 1 },
    label: { fontSize: "13px", fontWeight: "600", color: "#333" },
    input: { padding: "12px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", width: "100%" },
    modalActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" },
    button: { padding: "12px 20px", background: BRAND_RED, color: "#fff", border: "none", borderRadius: "4px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" },
    cancelButton: { padding: "12px 20px", background: "#fff", color: "#555", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
    errorMessage: { padding: "10px", background: "#ffebee", color: "#c62828", borderRadius: "4px", fontSize: "13px", marginBottom: "15px", textAlign: "center" }
};

export default VehicleRequest;
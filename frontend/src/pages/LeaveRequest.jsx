import { useState, useEffect } from "react";
import api from "../services/api";

const BRAND_RED = "#d6001c";

const STATUS_STYLES = {
    PENDING: { label: "Beklemede", bg: "#fff3cd", color: "#8a6100" },
    APPROVED: { label: "Onaylandı", bg: "#e6f4ea", color: "#1e7e34" },
    REJECTED: { label: "Reddedildi", bg: "#ffebee", color: "#c62828" },
};

function LeaveRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const getCurrentUserId = () => {
        const localUserId = localStorage.getItem("userId") || localStorage.getItem("authUserId");
        const sessionUserId = sessionStorage.getItem("userId") || sessionStorage.getItem("authUserId");
        return localUserId || sessionUserId || "1";
    };

    const currentUserId = getCurrentUserId();

    const [leaveType, setLeaveType] = useState("Yıllık İzin");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // İZİN TALEPLERİNİ SADECE GİRİŞ YAPAN KULLANICI İÇİN ÇEKME
    const fetchLeaveRequests = async () => {
        setLoading(true);
        setError("");
        try {
            // Önce kullanıcıya özel endpoint'i çağırıyoruz
            let response = await api.get(`/leave-requests/user/${currentUserId}`).catch(() => null);

            // Eğer özel endpoint null dönerse genel endpoint'ten çekip frontend'de filtrele
            if (!response || !response.data) {
                const allRes = await api.get("/leave-requests");
                const allData = Array.isArray(allRes.data) ? allRes.data : [];
                response = {
                    data: allData.filter(item => item.user && String(item.user.id) === String(currentUserId))
                };
            }

            const rawList = Array.isArray(response.data) ? response.data : [];

            const cleanList = rawList.map((item) => ({
                id: item.id,
                leaveType: item.leaveType || item.type || "Yıllık İzin",
                startDate: item.startDate || item.start_date || "—",
                endDate: item.endDate || item.end_date || "—",
                reason: item.reason || "—",
                status: item.status || "PENDING",
                totalDays: item.totalDays || calculateDays(item.startDate, item.endDate)
            }));

            setRequests(cleanList);
        } catch (err) {
            setError("İzin talepleri yüklenirken bir hata oluştu.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = (start, end) => {
        if (!start || !end) return 1;
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 1;
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [currentUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        // Validasyon kontrolleri
        if (!startDate || !endDate) {
            setFormError("Lütfen başlangıç ve bitiş tarihlerini seçiniz.");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setFormError("Bitiş tarihi başlangıç tarihinden önce olamaz.");
            return;
        }

        if (!reason || reason.trim().length === 0) {
            setFormError("Lütfen izin açıklaması yazınız.");
            return;
        }

        setSubmitting(true);

        try {
            // Backend DTO'su ile birebir eşleşen JSON payload
            const requestData = {
                leaveType: leaveType,
                startDate: startDate,
                endDate: endDate,
                reason: reason.trim(),
                status: "PENDING",
                user: { id: parseInt(currentUserId, 10) }
            };

            const response = await api.post("/leave-requests", requestData);
            
            if (response.status === 200 || response.status === 201) {
                // Başarı mesajı ve form reset
                setShowModal(false);
                setStartDate("");
                setEndDate("");
                setReason("");
                setLeaveType("Yıllık İzin");

                // Listeyi yenile ki yeni talep anında görünsün
                await fetchLeaveRequests();
            }
        } catch (err) {
            console.error("İzin talebi hatası:", err);
            setFormError(err.response?.data?.message || "İzin talebi gönderilirken bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    // Kullanıcının İzin İstatistikleri (Kişiye Özel Hesaplama)
    const approvedDays = requests
        .filter(r => r.status === "APPROVED")
        .reduce((sum, r) => sum + (r.totalDays || 1), 0);

    const pendingRequestsCount = requests.filter(r => r.status === "PENDING").length;

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
                        <h2 style={styles.pageTitle}>İzin Talepleri</h2>
                        <p style={styles.pageSubtitle}>Geçmiş izin taleplerinizi görüntüleyin ve yeni talep oluşturun.</p>
                    </div>
                    <button style={styles.button} onClick={() => setShowModal(true)}>
                        + Yeni İzin Talebi
                    </button>
                </div>

                {/* ÖZET KARTLARI (KİŞİYE ÖZEL) */}
                <div style={styles.summaryRow}>
                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: BRAND_RED }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{14 - approvedDays > 0 ? 14 - approvedDays : 0}</span>
                            <span style={styles.summaryLabel}>KALAN İZİN GÜNÜ</span>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#1e7e34" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{approvedDays}</span>
                            <span style={styles.summaryLabel}>KULLANILAN GÜN</span>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#8a6100" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{pendingRequestsCount}</span>
                            <span style={styles.summaryLabel}>BEKLEYEN TALEP</span>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#0288d1" }} />
                        <div style={styles.cardInnerContent}>
                            <span style={styles.cardValue}>{requests.length}</span>
                            <span style={styles.summaryLabel}>TOPLAM TALEP</span>
                        </div>
                    </div>
                </div>

                {/* KİŞİYE ÖZEL İZİN GEÇMİŞİ TABLOSU */}
                <h3 style={styles.sectionTitle}>Talep Geçmişi</h3>
                <div style={styles.card}>
                    {error && <div style={styles.errorMessage}>{error}</div>}

                    {loading ? (
                        <div style={styles.emptyState}>Yükleniyor...</div>
                    ) : requests.length === 0 ? (
                        <div style={styles.emptyState}>Henüz oluşturulmuş bir izin talebiniz bulunmuyor.</div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>Tarih Aralığı</th>
                                <th style={styles.th}>Tür</th>
                                <th style={styles.th}>Gün</th>
                                <th style={styles.th}>Açıklama</th>
                                <th style={styles.th}>Durum</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((r) => {
                                const status = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
                                return (
                                    <tr key={r.id}>
                                        <td style={styles.td}>
                                            {r.startDate} <br />
                                            <small style={{ color: "#888" }}>ile {r.endDate}</small>
                                        </td>
                                        <td style={{ ...styles.td, fontWeight: "bold" }}>{r.leaveType}</td>
                                        <td style={styles.td}>{r.totalDays || 1} Gün</td>
                                        <td style={styles.td}>{r.reason}</td>
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

            {/* MODAL */}
            {showModal && (
                <div style={styles.overlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Yeni İzin Talebi</h3>
                            <button style={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
                        </div>

                        {formError && <div style={styles.errorMessage}>{formError}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>İzin Türü</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="Yıllık İzin">Yıllık İzin</option>
                                    <option value="Mazeret İzni">Mazeret İzni</option>
                                    <option value="Sağlık / Rapor">Sağlık / Rapor</option>
                                    <option value="Ücretsiz İzin">Ücretsiz İzin</option>
                                    <option value="Doğum/Evlilik İzni">Doğum / Evlilik İzni</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Başlangıç *</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Bitiş *</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Açıklama / Mazeret</label>
                                <textarea
                                    placeholder="İzin gerekçenizi kısaca açıklayınız..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    style={{ ...styles.input, resize: "vertical", minHeight: "80px" }}
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

export default LeaveRequest;
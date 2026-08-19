import { useState, useEffect } from "react";
import api from "../services/api";

const BRAND_RED = "#d6001c";

const STATUS_STYLES = {
    PENDING: { label: "Beklemede", bg: "#fff3cd", color: "#8a6100" },
    MANAGER_APPROVED: { label: "Yönetici Onayladı", bg: "#e1f5fe", color: "#0288d1" },
    MANAGER_REJECTED: { label: "Yönetici Reddetti", bg: "#ffebee", color: "#c62828" },
    HR_APPROVED: { label: "Onaylandı", bg: "#e6f4ea", color: "#1e7e34" },
    HR_REJECTED: { label: "Reddedildi", bg: "#ffebee", color: "#c62828" },
};

function UpdateRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const currentUserId = localStorage.getItem("userId") || "1";

    const [userProfile, setUserProfile] = useState({
        phone: "",
        address: "",
        emergencyContact: "",
        iban: ""
    });

    const [selectedField, setSelectedField] = useState({
        label: "",
        apiKey: "",
        category: ""
    });

    const [oldValue, setOldValue] = useState("");
    const [newValue, setNewValue] = useState("");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // ŞİFRE DEĞİŞTİRME STATE'LERİ
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMessage, setPwdMessage] = useState({ type: "", text: "" });

    const fieldNameTranslate = {
        Phone: "Telefon Numarası",
        Address: "İkametgah Adresi",
        EmergencyContact: "Acil Durum İletişimi",
        IBAN: "Maaş IBAN Bilgisi",
        "Telefon Numarası": "Telefon Numarası",
        "İkametgah Adresi": "İkametgah Adresi",
        "Acil Durum İletişimi": "Acil Durum İletişimi",
        "Maaş IBAN Bilgisi": "Maaş IBAN Bilgisi"
    };

    const fetchUser = async () => {
        try {
            let user = null;
            const res = await api.get(`/user/${currentUserId}`).catch(() => null);
            if (res && res.data) {
                user = res.data;
            } else {
                const allRes = await api.get("/user").catch(() => null);
                if (allRes && Array.isArray(allRes.data)) {
                    user = allRes.data.find(u => String(u.id) === String(currentUserId)) || allRes.data[0];
                }
            }

            if (user) {
                setUserProfile({
                    phone: user.phone || user.phoneNumber || "",
                    address: user.address || user.residenceAddress || "",
                    emergencyContact: user.emergencyContactName || user.emergencyContactPhone || user.emergencyContact || "",
                    iban: user.iban || ""
                });
            }
        } catch (err) {
            console.error("Kullanıcı bilgileri çekilemedi:", err);
        }
    };

    const fetchUpdateRequests = async () => {
        setLoading(true);
        setError("");
        try {
            let response = await api.get(`/update-requests/user/${currentUserId}`).catch(() => null);
            if (!response || !response.data) {
                response = await api.get("/update-requests").catch(() => ({ data: [] }));
            }

            const rawList = Array.isArray(response.data) ? response.data : [];

            const cleanList = rawList.map((item) => {
                const oldVal = item.oldValue || item.old_value;
                const newVal = item.newValue || item.new_value;
                const resNote = item.reason || item.description;

                return {
                    id: item.id,
                    fieldName: item.fieldName || item.field_name || "Telefon Numarası",
                    oldValue: (oldVal && String(oldVal).trim() !== "") ? oldVal : "Kayıtlı değil",
                    newValue: (newVal && String(newVal).trim() !== "") ? newVal : "Girilmedi",
                    reason: (resNote && String(resNote).trim() !== "") ? resNote : "Açıklama yok",
                    status: item.status || "PENDING",
                    requestDate: item.requestDate || item.request_date || ""
                };
            });

            setRequests(cleanList);
        } catch (err) {
            setError("Güncelleme talepleri yüklenirken bir hata oluştu.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchUpdateRequests();
    }, [currentUserId]);

    const handleOpenModal = (label, apiKey, category) => {
        let currentVal = "";
        if (apiKey === "Phone") currentVal = userProfile.phone;
        else if (apiKey === "Address") currentVal = userProfile.address;
        else if (apiKey === "EmergencyContact") currentVal = userProfile.emergencyContact;
        else if (apiKey === "IBAN") currentVal = userProfile.iban;

        const displayVal = currentVal && currentVal.trim() !== "" ? currentVal : "Sistemde kayıtlı değer yok";

        setSelectedField({ label, apiKey, category });
        setOldValue(displayVal);
        setNewValue("");
        setReason("");
        setFormError("");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!newValue.trim()) {
            setFormError("Lütfen yeni değeri giriniz.");
            return;
        }

        if (!reason.trim()) {
            setFormError("Lütfen değişiklik sebebini giriniz.");
            return;
        }

        setSubmitting(true);

        try {
            let validUserId = parseInt(currentUserId, 10);
            if (isNaN(validUserId)) validUserId = 1;

            const requestData = {
                fieldName: selectedField.label || "İkametgah Adresi",
                oldValue: oldValue === "Sistemde kayıtlı değer yok" ? "Kayıtlı değil" : oldValue,
                newValue: newValue.trim(),
                reason: reason.trim(),
                status: "PENDING",
                requestDate: new Date().toISOString().split("T")[0],
                user: { id: validUserId }
            };

            await api.post("/update-requests", requestData);

            setShowModal(false);
            setNewValue("");
            setReason("");

            await fetchUpdateRequests();
            await fetchUser();
        } catch (err) {
            setFormError("Talep gönderilirken bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    // İKSİZ DİREKT ŞİFRE GÜNCELLEME İŞLEMİ
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwdMessage({ type: "", text: "" });

        if (newPassword !== confirmPassword) {
            setPwdMessage({ type: "danger", text: "Yeni şifreleriniz birbiriyle eşleşmiyor!" });
            return;
        }

        if (newPassword.length < 6) {
            setPwdMessage({ type: "danger", text: "Yeni şifreniz en az 6 karakter olmalıdır." });
            return;
        }

        setPwdLoading(true);

        try {
            const payload = {
                userId: parseInt(currentUserId, 10),
                currentPassword,
                newPassword
            };

            const response = await api.post("/users/change-password", payload);

            setPwdMessage({ type: "success", text: response.data });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const msg = err.response?.data || "Şifre güncellenirken bir hata oluştu.";
            setPwdMessage({ type: "danger", text: typeof msg === "string" ? msg : "Mevcut şifreniz hatalı!" });
        } finally {
            setPwdLoading(false);
        }
    };

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
                        <h2 style={styles.pageTitle}>Kişisel Özlük Bilgileri</h2>
                        <p style={styles.pageSubtitle}>Sistemde kayıtlı bilgilerinizi güncelleyebilir veya İK onayına sunabilirsiniz.</p>
                    </div>
                </div>

                {/* ÖZLÜK BİLGİLERİ KARTLARI */}
                <div style={styles.summaryRow}>
                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#0288d1" }} />
                        <div style={styles.cardInnerContent}>
                            <div style={styles.cardHeaderSmall}>
                                <span style={styles.summaryLabel}>MOBİL TELEFON</span>
                                <span style={styles.badgeCategory}>İletişim</span>
                            </div>
                            <span style={styles.cardValue}>{userProfile.phone || "Kayıtlı değil"}</span>
                            <button
                                style={styles.cardActionButton}
                                onClick={() => handleOpenModal("Telefon Numarası", "Phone", "İletişim")}
                            >
                                Güncelleme Talep Et &rarr;
                            </button>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#1e7e34" }} />
                        <div style={styles.cardInnerContent}>
                            <div style={styles.cardHeaderSmall}>
                                <span style={styles.summaryLabel}>İKAMETGAH ADRESİ</span>
                                <span style={styles.badgeCategory}>Lokasyon</span>
                            </div>
                            <span style={styles.cardValue}>{userProfile.address || "Kayıtlı değil"}</span>
                            <button
                                style={styles.cardActionButton}
                                onClick={() => handleOpenModal("İkametgah Adresi", "Address", "Lokasyon")}
                            >
                                Güncelleme Talep Et &rarr;
                            </button>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: "#8a6100" }} />
                        <div style={styles.cardInnerContent}>
                            <div style={styles.cardHeaderSmall}>
                                <span style={styles.summaryLabel}>ACİL DURUM KİŞİSİ</span>
                                <span style={styles.badgeCategory}>Güvenlik</span>
                            </div>
                            <span style={styles.cardValue}>{userProfile.emergencyContact || "Kayıtlı değil"}</span>
                            <button
                                style={styles.cardActionButton}
                                onClick={() => handleOpenModal("Acil Durum İletişimi", "EmergencyContact", "Güvenlik")}
                            >
                                Güncelleme Talep Et &rarr;
                            </button>
                        </div>
                    </div>

                    <div style={styles.summaryCard}>
                        <div style={{ ...styles.summaryAccent, background: BRAND_RED }} />
                        <div style={styles.cardInnerContent}>
                            <div style={styles.cardHeaderSmall}>
                                <span style={styles.summaryLabel}>MAAŞ HESABI (IBAN)</span>
                                <span style={styles.badgeCategory}>Finans</span>
                            </div>
                            <span style={{ ...styles.cardValue, fontSize: "13px", fontFamily: "monospace" }}>
                                {userProfile.iban || "IBAN bilgisi bulunamadı"}
                            </span>
                            <button
                                style={styles.cardActionButton}
                                onClick={() => handleOpenModal("Maaş IBAN Bilgisi", "IBAN", "Finans & Bordro")}
                            >
                                Güncelleme Talep Et &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLO */}
                <h3 style={styles.sectionTitle}>Değişiklik Talep Geçmişi</h3>
                <div style={styles.card}>
                    {error && <div style={styles.errorMessage}>{error}</div>}

                    {loading ? (
                        <div style={styles.emptyState}>Yükleniyor...</div>
                    ) : requests.length === 0 ? (
                        <div style={styles.emptyState}>Henüz bir bilgi güncelleme talebiniz bulunmuyor.</div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>Alan / Kategori</th>
                                <th style={styles.th}>Mevcut (Eski) Bilgi</th>
                                <th style={styles.th}>Talep Edilen Yeni Bilgi</th>
                                <th style={styles.th}>Açıklama</th>
                                <th style={styles.th}>Durum</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((r) => {
                                const status = STATUS_STYLES[r.status] || STATUS_STYLES.PENDING;
                                return (
                                    <tr key={r.id}>
                                        <td style={{ ...styles.td, fontWeight: "bold" }}>
                                            {fieldNameTranslate[r.fieldName] || r.fieldName || "Kişisel Bilgi"}
                                        </td>
                                        <td style={styles.td}>{r.oldValue}</td>
                                        <td style={{ ...styles.td, color: BRAND_RED, fontWeight: "bold" }}>{r.newValue}</td>
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

                {/* DİREKT ŞİFRE GÜNCELLEME KARTI (İK ONAYSIZ) */}
                <div style={{ ...styles.card, marginTop: "28px", padding: "24px" }}>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#222", fontWeight: "bold" }}>
                        Güvenlik ve Şifre Güncelleme
                    </h3>
                    <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#666" }}>
                        Mevcut şifrenizi doğrulayarak yeni şifrenizi anında güncelleyebilirsiniz.
                    </p>

                    {pwdMessage.text && (
                        <div style={{
                            padding: "10px 14px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            marginBottom: "16px",
                            fontWeight: "bold",
                            backgroundColor: pwdMessage.type === "success" ? "#e6f4ea" : "#ffebee",
                            color: pwdMessage.type === "success" ? "#1e7e34" : "#c62828"
                        }}>
                            {pwdMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                            <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Mevcut Şifre *</label>
                            <input
                                type="password"
                                required
                                placeholder="Mevcut şifrenizi giriniz (Örn: Toyota123!)"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "200px", textAlign: "left" }}>
                                <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Yeni Şifre *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="En az 6 karakter..."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "200px", textAlign: "left" }}>
                                <label style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>Yeni Şifre (Tekrar) *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Yeni şifrenizi tekrar giriniz..."
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={pwdLoading}
                            style={{
                                padding: "12px 20px",
                                background: BRAND_RED,
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "14px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginTop: "6px",
                                alignSelf: "flex-start"
                            }}
                        >
                            {pwdLoading ? "Güncelleniyor..." : "Şifremi Güncelle"}
                        </button>
                    </form>
                </div>

            </main>

            {/* MODAL */}
            {showModal && (
                <div style={styles.overlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>{selectedField.label} Güncelleme</h3>
                            <button
                                style={styles.closeButton}
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        {formError && <div style={styles.errorMessage}>{formError}</div>}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Sistemdeki Aktif Veriniz</label>
                                <input
                                    type="text"
                                    disabled
                                    value={oldValue}
                                    style={styles.disabledInput}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Yeni Değer *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Lütfen güncel bilgiyi eksiksiz giriniz..."
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Değişiklik Sebebi / İK Notu *</label>
                                <textarea
                                    required
                                    placeholder="Bu bilginin neden değiştirildiğini açıklayınız..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    style={{ ...styles.input, resize: "vertical", minHeight: "80px" }}
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={() => setShowModal(false)}
                                >
                                    Vazgeç
                                </button>
                                <button type="submit" disabled={submitting} style={styles.button}>
                                    {submitting ? "Gönderiliyor..." : "Talebi İK'ya İlet"}
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
    page: {
        minHeight: "100vh",
        background: "#f4f4f4",
    },
    header: {
        background: "#ffffff",
        borderBottom: `3px solid ${BRAND_RED}`,
        padding: "16px 32px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
    },
    brandContainer: {
        display: "flex",
        alignItems: "baseline",
        gap: "10px",
    },
    title: {
        margin: "0",
        color: BRAND_RED,
        fontSize: "24px",
        letterSpacing: "2px",
    },
    subtitle: {
        color: "#555",
        fontSize: "13px",
        fontWeight: "bold",
    },
    container: {
        maxWidth: "960px",
        margin: "0 auto",
        padding: "32px 24px",
        boxSizing: "border-box",
    },
    pageHeaderRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap",
    },
    pageTitle: {
        margin: "0 0 4px 0",
        fontSize: "22px",
        color: "#222",
        fontWeight: "bold",
    },
    pageSubtitle: {
        margin: 0,
        fontSize: "13px",
        color: "#666",
    },
    summaryRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "16px",
        marginBottom: "28px",
    },
    summaryCard: {
        display: "flex",
        alignItems: "stretch",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
    },
    summaryAccent: {
        width: "4px",
        flexShrink: 0,
    },
    cardInnerContent: {
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        gap: "8px",
        width: "100%",
    },
    cardHeaderSmall: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryLabel: {
        fontSize: "11px",
        color: "#666",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
    },
    badgeCategory: {
        fontSize: "10px",
        padding: "2px 6px",
        background: "#f0f0f0",
        borderRadius: "4px",
        color: "#555",
        fontWeight: "600",
    },
    cardValue: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "#222",
        wordBreak: "break-word",
        minHeight: "36px",
        display: "flex",
        alignItems: "center",
    },
    cardActionButton: {
        padding: "8px 12px",
        background: "#ffffff",
        color: "#222",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        cursor: "pointer",
        textAlign: "center",
        marginTop: "auto",
        transition: "all 0.2s",
    },
    sectionTitle: {
        margin: "0 0 12px 0",
        fontSize: "15px",
        color: "#333",
        fontWeight: "700",
    },
    card: {
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: "8px",
        boxSizing: "border-box",
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
    },
    th: {
        textAlign: "left",
        padding: "14px 16px",
        color: "#ffffff",
        backgroundColor: BRAND_RED,
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        borderBottom: "none",
    },
    td: {
        padding: "14px 16px",
        borderBottom: "1px solid #eee",
        color: "#333",
    },
    badge: {
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold",
    },
    emptyState: {
        padding: "40px 16px",
        textAlign: "center",
        color: "#888",
        fontSize: "14px",
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000,
    },
    modal: {
        width: "100%",
        maxWidth: "460px",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        padding: "28px",
        boxSizing: "border-box",
    },
    modalHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
    },
    modalTitle: {
        margin: 0,
        fontSize: "18px",
        color: "#222",
        fontWeight: "bold",
    },
    closeButton: {
        border: "none",
        background: "transparent",
        fontSize: "22px",
        lineHeight: 1,
        color: "#888",
        cursor: "pointer",
        padding: "0 4px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        gap: "6px",
        flex: 1,
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
        fontFamily: "inherit",
        boxSizing: "border-box",
        width: "100%",
    },
    disabledInput: {
        padding: "12px",
        borderRadius: "4px",
        border: "1px solid #e0e0e0",
        backgroundColor: "#f9f9f9",
        color: "#666",
        fontSize: "14px",
        width: "100%",
        boxSizing: "border-box",
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "4px",
    },
    button: {
        padding: "12px 20px",
        background: BRAND_RED,
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background 0.2s",
    },
    cancelButton: {
        padding: "12px 20px",
        background: "#fff",
        color: "#555",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
    },
    errorMessage: {
        padding: "10px",
        background: "#ffebee",
        color: "#c62828",
        borderRadius: "4px",
        fontSize: "13px",
        marginBottom: "15px",
        textAlign: "center",
    },
};

export default UpdateRequests;
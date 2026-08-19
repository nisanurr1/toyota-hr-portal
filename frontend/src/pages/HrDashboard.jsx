import React, { useState, useEffect } from "react";
import api from "../services/api";

function HrDashboard() {
    const [activeTab, setActiveTab] = useState("leave");
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [updateRequests, setUpdateRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // YENİ PERSONEL MODAL STATE'LERİ (roleName eklendi)
    const [showUserModal, setShowUserModal] = useState(false);
    const [userSubmitLoading, setUserSubmitLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        surname: "",
        email: "",
        employeeNo: "",
        departmentName: "Bilişim Teknolojileri (IT)",
        position: "",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        monthlySalary: "",
        birthDate: "",
        maritalStatus: "BEKAR",
        childrenCount: 0,
        roleName: "EMPLOYEE" // Varsayılan Rol
    });

    const calculateDays = (start, end) => {
        if (!start || !end) return 1;
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 1;
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [leaveRes, updateRes] = await Promise.all([
                api.get("/leave-requests").catch(() => ({ data: [] })),
                api.get("/update-requests").catch(() => ({ data: [] }))
            ]);

            const rawLeave = Array.isArray(leaveRes.data) ? leaveRes.data : [];

            const cleanLeave = rawLeave.map((item) => {
                const start = item?.startDate || item?.start_date || null;
                const end = item?.endDate || item?.end_date || null;
                const days = item?.totalDays || calculateDays(start, end);

                let employeeName = "Personel";
                if (item?.user) {
                    employeeName = `${item.user.name || ""} ${item.user.surname || ""}`.trim() || "Personel";
                }

                return {
                    id: item?.id,
                    userName: employeeName,
                    leaveType: item?.leaveType || "Yıllık İzin",
                    startDate: start,
                    endDate: end,
                    totalDays: days,
                    reason: item?.reason || "—",
                    status: String(item?.status || "PENDING").toUpperCase()
                };
            });

            setLeaveRequests(cleanLeave);
            setUpdateRequests(Array.isArray(updateRes.data) ? updateRes.data : []);
        } catch (err) {
            console.error("Veriler çekilemedi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleLeaveStatus = async (id, status) => {
        try {
            await api.put(`/leave-requests/${id}`, { status });
            alert(`İzin talebi ${status === "APPROVED" ? "Onaylandı" : "Reddedildi"}.`);
            fetchAllData();
        } catch (err) {
            console.error("Leave status error:", err);
            const errorMsg = err.response?.data?.message || err.message || "İşlem sırasında hata oluştu!";
            alert(`Hata: ${errorMsg}`);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            if (status === "HR_APPROVED") {
                await api.put(`/update-requests/${id}/hr/approve`);
            } else {
                await api.put(`/update-requests/${id}/hr/reject`);
            }
            alert(`Güncelleme talebi ${status === "HR_APPROVED" ? "Onaylandı" : "Reddedildi"}.`);
            fetchAllData();
        } catch (err) {
            alert("İşlem sırasında hata oluştu!");
        }
    };

    // YENİ PERSONELİ ROLÜYLE BİRLİKTE VERİTABANINA KAYDETME
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setUserSubmitLoading(true);

        try {
            const payload = {
                name: newUser.name.trim(),
                surname: newUser.surname.trim(),
                email: newUser.email.trim(),
                employeeNo: newUser.employeeNo.trim(),
                position: newUser.position.trim(),
                phone: newUser.phone ? newUser.phone.trim() : null,
                address: newUser.address ? newUser.address.trim() : null,
                emergencyContactName: newUser.emergencyContactName ? newUser.emergencyContactName.trim() : null,
                emergencyContactPhone: newUser.emergencyContactPhone ? newUser.emergencyContactPhone.trim() : null,
                birthDate: newUser.birthDate ? newUser.birthDate : null,
                childrenCount: newUser.maritalStatus === "EVLİ" ? parseInt(newUser.childrenCount, 10) || 0 : 0,
                password: "Toyota123!",
                status: "ACTIVE",
                hireDate: new Date().toISOString().split("T")[0],
                role: { roleName: newUser.roleName } // Rol bilgisi backend'e iletiliyor
            };

            await api.post("/users", payload);

            alert("Yeni çalışan sisteme ve veritabanına başarıyla eklendi.");
            setShowUserModal(false);
            setNewUser({
                name: "",
                surname: "",
                email: "",
                employeeNo: "",
                departmentName: "Bilişim Teknolojileri (IT)",
                position: "",
                phone: "",
                address: "",
                emergencyContactName: "",
                emergencyContactPhone: "",
                monthlySalary: "",
                birthDate: "",
                maritalStatus: "BEKAR",
                childrenCount: 0,
                roleName: "EMPLOYEE"
            });

            fetchAllData();
        } catch (err) {
            console.error("Personel ekleme hatası:", err);
            const serverError = err.response?.data || "Çalışan eklenirken sunucu hatası oluştu.";
            alert(`Hata: ${typeof serverError === "string" ? serverError : "Veritabanı kayıt hatası."}`);
        } finally {
            setUserSubmitLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 text-start" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>

            {/* ÜST BANNER & YENİ KAYIT BUTONU */}
            <div className="card bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <div className="card-body px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center">
                        <h2 className="fw-bold mb-0 text-danger" style={{ letterSpacing: "1px", fontSize: "24px" }}>TOYOTA</h2>
                        <span className="ms-3 text-secondary fw-semibold fs-6">İK Onay Paneli (HR Dashboard)</span>
                    </div>

                    <button
                        className="btn btn-danger fw-bold px-4 py-2"
                        style={{ backgroundColor: "#d6001c", borderColor: "#d6001c", borderRadius: "6px" }}
                        onClick={() => setShowUserModal(true)}
                    >
                        + Yeni Personel Kaydı
                    </button>
                </div>
                <div style={{ height: "4px", backgroundColor: "#d6001c", width: "100%" }}></div>
            </div>

            {/* SEKMELER */}
            <div className="d-flex gap-2 mb-4">
                <button
                    className={`btn fw-bold px-4 py-2 ${activeTab === "leave" ? "btn-danger" : "btn-outline-dark"}`}
                    onClick={() => setActiveTab("leave")}
                >
                    İzin Talepleri Onayı ({leaveRequests.length})
                </button>
                <button
                    className={`btn fw-bold px-4 py-2 ${activeTab === "update" ? "btn-danger" : "btn-outline-dark"}`}
                    onClick={() => setActiveTab("update")}
                >
                    Profil Güncelleme Onayı ({updateRequests.length})
                </button>
            </div>

            {/* TABLOLAR */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-4 text-center text-muted">Veriler yükleniyor...</div>
                    ) : activeTab === "leave" ? (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                <tr style={{ backgroundColor: "#d6001c", color: "#ffffff" }}>
                                    <th className="ps-4 py-3">ÇALIŞAN</th>
                                    <th className="py-3">İZİN TÜRÜ</th>
                                    <th className="py-3">TARİH ARALIĞI</th>
                                    <th className="py-3">SÜRE</th>
                                    <th className="py-3">AÇIKLAMA</th>
                                    <th className="py-3">DURUM</th>
                                    <th className="pe-4 py-3 text-end">İŞLEM</th>
                                </tr>
                                </thead>
                                <tbody>
                                {leaveRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            Onay bekleyen veya kayıtlı izin talebi bulunmamaktadır.
                                        </td>
                                    </tr>
                                ) : (
                                    leaveRequests.map((item) => (
                                        <tr key={item.id || Math.random()} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td className="ps-4 py-3 fw-bold">{item.userName}</td>
                                            <td className="fw-semibold">{item.leaveType}</td>
                                            <td className="text-secondary small fw-semibold">
                                                {item.startDate && item.endDate
                                                    ? `${item.startDate} – ${item.endDate}`
                                                    : "Tarih Belirtilmemiş"}
                                            </td>
                                            <td className="fw-bold text-danger">{item.totalDays} Gün</td>
                                            <td className="text-secondary small">{item.reason}</td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 ${
                                                    item.status === "APPROVED" ? "bg-success text-white" :
                                                        item.status === "REJECTED" ? "bg-danger text-white" : "bg-warning text-dark"
                                                }`}>
                                                    {item.status === "APPROVED" ? "Onaylandı" :
                                                        item.status === "REJECTED" ? "Reddedildi" : "Beklemede"}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                {item.status === "PENDING" || item.status === "BEKLEMEDE" ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className="btn btn-sm btn-success fw-bold px-3" onClick={() => handleLeaveStatus(item.id, "APPROVED")}>Onayla</button>
                                                        <button className="btn btn-sm btn-danger fw-bold px-3" onClick={() => handleLeaveStatus(item.id, "REJECTED")}>Reddet</button>
                                                    </div>
                                                ) : <span className="text-muted small">Tamamlandı</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                <tr style={{ backgroundColor: "#d6001c", color: "#ffffff" }}>
                                    <th className="ps-4 py-3">ALAN</th>
                                    <th className="py-3">ESKİ BİLGİ</th>
                                    <th className="py-3">YENİ BİLGİ</th>
                                    <th className="py-3">GEREKÇE</th>
                                    <th className="py-3">DURUM</th>
                                    <th className="pe-4 py-3 text-end">İŞLEM</th>
                                </tr>
                                </thead>
                                <tbody>
                                {updateRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            Onay bekleyen güncelleme talebi bulunmamaktadır.
                                        </td>
                                    </tr>
                                ) : (
                                    updateRequests.map((item) => (
                                        <tr key={item.id || Math.random()} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td className="ps-4 py-3 fw-bold">{item.fieldName}</td>
                                            <td className="text-secondary">{item.oldValue}</td>
                                            <td className="fw-bold text-danger">{item.newValue}</td>
                                            <td className="text-secondary small">{item.reason}</td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 ${item.status === "HR_APPROVED" ? "bg-success" : item.status === "HR_REJECTED" ? "bg-danger" : "bg-warning text-dark"}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                {item.status === "PENDING" ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button className="btn btn-sm btn-success fw-bold px-3" onClick={() => handleUpdateStatus(item.id, "HR_APPROVED")}>Onayla</button>
                                                        <button className="btn btn-sm btn-danger fw-bold px-3" onClick={() => handleUpdateStatus(item.id, "HR_REJECTED")}>Reddet</button>
                                                    </div>
                                                ) : <span className="text-muted small">Tamamlandı</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* YENİ PERSONEL EKLEME MODAL (POPUP) */}
            {showUserModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "8px" }}>
                            <div className="modal-header text-white py-3" style={{ backgroundColor: "#111827" }}>
                                <h5 className="modal-title fw-bold fs-6 text-uppercase">Yeni Çalışan / Personel Kaydı</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowUserModal(false)}></button>
                            </div>

                            <form onSubmit={handleCreateUser}>
                                <div className="modal-body p-4">
                                    {/* TEMEL KİMLİK BİLGİLERİ */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Ad *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                placeholder="Örn: Ahmet"
                                                value={newUser.name}
                                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Soyad *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                placeholder="Örn: Yılmaz"
                                                value={newUser.surname}
                                                onChange={(e) => setNewUser({ ...newUser, surname: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">E-Posta Adresi *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                required
                                                placeholder="ahmet.yilmaz@toyota.com"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Sicil Numarası *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                placeholder="TYT-2026-001"
                                                value={newUser.employeeNo}
                                                onChange={(e) => setNewUser({ ...newUser, employeeNo: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Unvan / Pozisyon *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                required
                                                placeholder="Örn: Yazılım Mühendisi"
                                                value={newUser.position}
                                                onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Telefon Numarası</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="0532 000 00 00"
                                                value={newUser.phone}
                                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* ROL / YETKİ SEÇİM ALANI (DÜZGÜN HİZALANDI) */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Kullanıcı Rolü / Yetkisi *</label>
                                            <select
                                                className="form-select border-danger fw-bold"
                                                value={newUser.roleName}
                                                onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
                                            >
                                                <option value="EMPLOYEE">Çalışan (EMPLOYEE)</option>
                                                <option value="HR">İnsan Kaynakları (HR)</option>
                                                <option value="ADMIN">Sistem Yöneticisi (ADMIN)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* ÖZLÜK BİLGİLERİ: DOĞUM TARİHİ, MEDENİ HAL, ÇOCUK SAYISI */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Doğum Tarihi</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newUser.birthDate}
                                                onChange={(e) => setNewUser({ ...newUser, birthDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Medeni Hal</label>
                                            <select
                                                className="form-select"
                                                value={newUser.maritalStatus}
                                                onChange={(e) => setNewUser({ ...newUser, maritalStatus: e.target.value })}
                                            >
                                                <option value="BEKAR">Bekar</option>
                                                <option value="EVLİ">Evli</option>
                                            </select>
                                        </div>
                                        {newUser.maritalStatus === "EVLİ" && (
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Çocuk Sayısı</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="form-control"
                                                    placeholder="0"
                                                    value={newUser.childrenCount}
                                                    onChange={(e) => setNewUser({ ...newUser, childrenCount: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* İKAMETGAH VE ACİL DURUM İLETİŞİM BİLGİLERİ */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">İkametgah Adresi</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                placeholder="İl, ilçe ve mahalle adresi..."
                                                value={newUser.address}
                                                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Acil Durum Kişisi (Ad Soyad)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Örn: Ayşe Yılmaz (Eşi/Annesi)"
                                                value={newUser.emergencyContactName}
                                                onChange={(e) => setNewUser({ ...newUser, emergencyContactName: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-secondary fs-7 text-uppercase">Acil Durum Telefonu</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="0535 000 00 00"
                                                value={newUser.emergencyContactPhone}
                                                onChange={(e) => setNewUser({ ...newUser, emergencyContactPhone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="alert alert-info py-2 px-3 small border-0 mb-0" style={{ backgroundColor: "#eff6ff", color: "#1e40af" }}>
                                        Eklenecek yeni personelin varsayılan giriş parolası <strong>Toyota123!</strong> olarak belirlenecektir.
                                    </div>
                                </div>

                                <div className="modal-footer bg-light py-2 px-4">
                                    <button type="button" className="btn btn-secondary px-4 fw-semibold" onClick={() => setShowUserModal(false)}>
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger px-4 fw-bold"
                                        style={{ backgroundColor: "#d6001c", borderColor: "#d6001c" }}
                                        disabled={userSubmitLoading}
                                    >
                                        {userSubmitLoading ? "Kaydediliyor..." : "Çalışanı Kaydet"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default HrDashboard;
import React, { useState, useEffect } from "react";
import api from "../services/api";

function VehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [requests, setRequests] = useState([]); // Gelen araç talepleri
    const [loading, setLoading] = useState(true);

    // Form State'leri (Marka, Model, Yıl, Yakıt Türü, Müsaitlik)
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [fuelType, setFuelType] = useState("Benzin");
    const [available, setAvailable] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Mevcut araçları çek
    const fetchVehicles = async () => {
        try {
            const response = await api.get("/vehicles");
            setVehicles(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Araçlar yüklenemedi:", err);
        }
    };

    // Çalışan araç taleplerini çek
    const fetchVehicleRequests = async () => {
        try {
            const response = await api.get("/vehicle-requests");
            setRequests(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Araç talepleri yüklenemedi:", err);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchVehicles(), fetchVehicleRequests()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Yeni araç ekleme
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        const newVehicle = {
            brand,
            model,
            year: parseInt(year, 10),
            fuelType,
            available
        };

        try {
            await api.post("/vehicles", newVehicle);
            setMessage({ type: "success", text: "Araç başarıyla sisteme eklendi!" });
            setBrand("");
            setModel("");
            fetchVehicles();
        } catch (err) {
            setMessage({ type: "danger", text: "Araç eklenirken bir hata oluştu." });
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    // Aracın müsaitlik durumunu değiştirme
    const toggleAvailability = async (vehicle) => {
        try {
            const updatedVehicle = { ...vehicle, available: !vehicle.available };
            await api.put(`/vehicles/${vehicle.id}`, updatedVehicle);
            fetchVehicles();
        } catch (err) {
            alert("Durum güncellenirken hata oluştu.");
        }
    };

    // Aracı sistemden silme
    const deleteVehicle = async (id) => {
        if (window.confirm("Bu aracı sistemden tamamen silmek istediğinize emin misiniz?")) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchVehicles();
            } catch (err) {
                alert("Araç silinirken hata oluştu.");
            }
        }
    };

    // Talep durumunu güncelleme (Onayla / Reddet)
    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            // Mevcut talebi bulup sadece status alanını güncelleyerek gönderiyoruz
            const targetRequest = requests.find(r => r.id === requestId);
            if (!targetRequest) return;

            const updatedRequest = { ...targetRequest, status: newStatus };
            await api.put(`/vehicle-requests/${requestId}`, updatedRequest);
            
            // Listeyi yenile
            fetchVehicleRequests();
        } catch (err) {
            alert("Talep durumu güncellenirken hata oluştu.");
            console.error(err);
        }
    };

    return (
        <div className="container-fluid py-4 text-start" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            
            {/* BAŞLIK */}
            <div className="card bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <div className="card-body px-4 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <h2 className="fw-bold mb-0 text-danger" style={{ letterSpacing: "1px", fontSize: "24px" }}>TOYOTA</h2>
                        <span className="ms-3 text-secondary fw-semibold fs-6">Araç / Filo Yönetimi Paneli</span>
                    </div>
                    <div className="d-flex gap-2">
                        <span className="badge bg-light text-dark border px-3 py-2 fw-bold" style={{ fontSize: "12px" }}>
                            TOPLAM ARAÇ: {vehicles.length}
                        </span>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-bold" style={{ fontSize: "12px" }}>
                            GELEN TALEP: {requests.length}
                        </span>
                    </div>
                </div>
                <div style={{ height: "4px", backgroundColor: "#d6001c", width: "100%" }}></div>
            </div>

            <div className="row g-4">
                {/* SOL TARAF: YENİ ARAÇ EKLEME FORMU */}
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "8px" }}>
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="fw-bold text-dark mb-0 fs-6">Yeni Araç Ekle</h5>
                        </div>
                        <div className="card-body p-4">
                            {message.text && (
                                <div className={`alert alert-${message.type} py-2 px-3 small mb-3`}>
                                    {message.text}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label small fw-bold text-secondary mb-1">Marka *</label>
                                    <input type="text" className="form-control" required placeholder="Örn: Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} />
                                </div>
                                <div>
                                    <label className="form-label small fw-bold text-secondary mb-1">Model *</label>
                                    <input type="text" className="form-control" required placeholder="Örn: Corolla" value={model} onChange={(e) => setModel(e.target.value)} />
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary mb-1">Yıl *</label>
                                        <input type="number" className="form-control" required min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-secondary mb-1">Yakıt Türü *</label>
                                        <select className="form-select" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                                            <option value="Benzin">Benzin</option>
                                            <option value="Dizel">Dizel</option>
                                            <option value="Hibrit">Hibrit</option>
                                            <option value="Elektrik">Elektrik</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label small fw-bold text-secondary mb-1">Başlangıç Durumu</label>
                                    <select className="form-select" value={available} onChange={(e) => setAvailable(e.target.value === "true")}>
                                        <option value="true">Müsait (Kullanıma Hazır)</option>
                                        <option value="false">Müsait Değil (Serviste/Pasif)</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={submitting} className="btn btn-danger fw-bold mt-2" style={{ backgroundColor: "#d6001c" }}>
                                    {submitting ? "Ekleniyor..." : "+ Sisteme Kaydet"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* SAĞ TARAF: MEVCUT ARAÇ LİSTESİ */}
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "8px" }}>
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="fw-bold text-dark mb-0 fs-6">Sistemdeki Araçlar (Filo Envanteri)</h5>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-4 text-center text-muted">Yükleniyor...</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead>
                                            <tr className="bg-light text-secondary" style={{ fontSize: "12px" }}>
                                                <th className="ps-4 py-3">ARAÇ BİLGİSİ</th>
                                                <th className="py-3">YAKIT & YIL</th>
                                                <th className="py-3">DURUM</th>
                                                <th className="pe-4 py-3 text-end">İŞLEMLER</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicles.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-muted">Sistemde kayıtlı araç bulunmamaktadır.</td>
                                                </tr>
                                            ) : (
                                                vehicles.map((v) => (
                                                    <tr key={v.id}>
                                                        <td className="ps-4 py-3">
                                                            <strong className="d-block text-dark">{v.brand} {v.model}</strong>
                                                            <small className="text-muted">ID: #{v.id}</small>
                                                        </td>
                                                        <td>
                                                            <span className="d-block fw-semibold">{v.fuelType}</span>
                                                            <small className="text-muted">{v.year}</small>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${v.available ? "bg-success" : "bg-danger"}`}>
                                                                {v.available ? "Müsait" : "Müsait Değil"}
                                                            </span>
                                                        </td>
                                                        <td className="pe-4 text-end">
                                                            <button 
                                                                className={`btn btn-sm fw-bold me-2 ${v.available ? "btn-outline-danger" : "btn-outline-success"}`}
                                                                onClick={() => toggleAvailability(v)}
                                                            >
                                                                {v.available ? "Pasife Çek" : "Aktife Al"}
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-light text-danger fw-bold border"
                                                                onClick={() => deleteVehicle(v.id)}
                                                            >
                                                                Sil
                                                            </button>
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
                </div>
            </div>

            {/* ALT KISIM: ÇALIŞAN ARAÇ TALEPLERİ VE ONAY/RET PANELİ */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "8px" }}>
                        <div className="card-header bg-white py-3 border-bottom">
                            <h5 className="fw-bold text-dark mb-0 fs-6">Gelen Araç Talepleri (Yönetici Onay Paneli)</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead>
                                        <tr className="bg-light text-secondary" style={{ fontSize: "12px" }}>
                                            <th className="ps-4 py-3">TALEP ID & ÇALIŞAN</th>
                                            <th className="py-3">ARAÇ BİLGİSİ</th>
                                            <th className="py-3">KULLANIM TARİHİ</th>
                                            <th className="py-3">AMAÇ</th>
                                            <th className="py-3">DURUM</th>
                                            <th className="pe-4 py-3 text-end">İŞLEMLER</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">Henüz oluşturulmuş bir araç talebi bulunmuyor.</td>
                                            </tr>
                                        ) : (
                                            requests.map((r) => (
                                                <tr key={r.id}>
                                                    <td className="ps-4 py-3">
                                                        <strong className="d-block text-dark">Talep #{r.id}</strong>
                                                        <small className="text-muted">Kullanıcı ID: {r.user ? r.user.id : "Bilinmiyor"}</small>
                                                    </td>
                                                    <td>
                                                        <span className="d-block fw-semibold">
                                                            {r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : "Araç Belirtilmemiş"}
                                                        </span>
                                                    </td>
                                                    <td>{r.usageDate}</td>
                                                    <td>{r.purpose}</td>
                                                    <td>
                                                        <span className={`badge ${
                                                            r.status === "APPROVED" || r.status?.includes("APPROVED") ? "bg-success" : 
                                                            r.status === "REJECTED" || r.status?.includes("REJECTED") ? "bg-danger" : 
                                                            "bg-warning text-dark"
                                                        }`}>
                                                            {r.status === "APPROVED" || r.status?.includes("APPROVED") ? "Onaylandı" : 
                                                             r.status === "REJECTED" || r.status?.includes("REJECTED") ? "Reddedildi" : 
                                                             "Beklemede"}
                                                        </span>
                                                    </td>
                                                    <td className="pe-4 text-end">
                                                        <button 
                                                            className="btn btn-sm btn-success fw-bold me-2"
                                                            onClick={() => updateRequestStatus(r.id, "APPROVED")}
                                                        >
                                                            Onayla
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-danger fw-bold"
                                                            onClick={() => updateRequestStatus(r.id, "REJECTED")}
                                                        >
                                                            Reddet
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default VehicleManagement;
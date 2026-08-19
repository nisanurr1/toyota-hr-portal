import { useEffect, useState } from "react";
import api from "../services/api";

function ManagerDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get("/update-requests");
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Talepler yüklenemedi:", err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const approve = async (id) => {
        try {
            await api.put(`/update-requests/${id}/manager/approve`);
            loadRequests();
        } catch (err) {
            alert("Onaylama işlemi sırasında bir hata oluştu.");
        }
    };

    const reject = async (id) => {
        try {
            await api.put(`/update-requests/${id}/manager/reject`);
            loadRequests();
        } catch (err) {
            alert("Reddetme işlemi sırasında bir hata oluştu.");
        }
    };

    const pendingRequests = requests.filter((r) => r.status === "PENDING");

    return (
        <div className="container-fluid py-4 text-start" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>

            {/* ÜST HEADER (HrDashboard ile birebir aynı) */}
            <div className="card bg-white border-0 shadow-sm mb-4" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <div className="card-body px-4 py-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <h2 className="fw-bold mb-0 text-danger" style={{ letterSpacing: "1px", fontSize: "24px" }}>TOYOTA</h2>
                        <span className="ms-3 text-secondary fw-semibold fs-6">Yönetici Onay Paneli (Manager Dashboard)</span>
                    </div>
                    <div>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-bold" style={{ fontSize: "12px" }}>
                            BEKLEYEN: {pendingRequests.length}
                        </span>
                    </div>
                </div>
                <div style={{ height: "4px", backgroundColor: "#d6001c", width: "100%" }}></div>
            </div>

            {/* TABLO KARTI (HrDashboard ile birebir aynı stil) */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-4 text-center text-muted">Veriler yükleniyor...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                <tr style={{ backgroundColor: "#d6001c", color: "#ffffff" }}>
                                    <th className="ps-4 py-3">PERSONEL</th>
                                    <th className="py-3">ALAN</th>
                                    <th className="py-3">ESKİ BİLGİ</th>
                                    <th className="py-3">YENİ BİLGİ</th>
                                    <th className="py-3">DURUM</th>
                                    <th className="pe-4 py-3 text-end">İŞLEM</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pendingRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            Onay bekleyen güncelleme talebi bulunmamaktadır.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingRequests.map((r) => (
                                        <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td className="ps-4 py-3 fw-bold">
                                                {r.user ? `${r.user.name || ""} ${r.user.surname || ""}`.trim() : "Personel Bilgisi Yok"}
                                            </td>
                                            <td className="fw-semibold">{r.fieldName}</td>
                                            <td className="text-secondary">{r.oldValue || "—"}</td>
                                            <td className="fw-bold text-danger">{r.newValue}</td>
                                            <td>
                                                    <span className="badge rounded-pill bg-warning text-dark px-3 py-2">
                                                        {r.status === "PENDING" ? "Beklemede" : r.status}
                                                    </span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-success fw-bold px-3"
                                                        onClick={() => approve(r.id)}
                                                    >
                                                        Onayla
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger fw-bold px-3"
                                                        onClick={() => reject(r.id)}
                                                    >
                                                        Reddet
                                                    </button>
                                                </div>
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
    );
}

export default ManagerDashboard;
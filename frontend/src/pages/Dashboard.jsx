import React, { useState, useEffect } from "react";
import api from "../services/api";

function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVehicles: 0,
        availableVehicles: 0,
        pendingLeaveRequests: 0,
    });
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const currentUserId = localStorage.getItem("userId");
    const [userProfile, setUserProfile] = useState({
        fullName: localStorage.getItem("fullName") || "Toyota Admin",
        role: localStorage.getItem("role") || "ADMIN",
        employeeNo: "TYT-2026-001",
        department: "İnsan Kaynakları & Yönetim",
        photo: null
    });

    useEffect(() => {
        let isMounted = true;

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await api.get("/dashboard").catch(() => null);

                if (isMounted) {
                    if (response && response.data) {
                        setStats(response.data);
                    } else if (currentUserId) {
                        const myLeaves = await api.get(`/leave-requests/user/${currentUserId}`).catch(() => ({ data: [] }));
                        const leavesList = Array.isArray(myLeaves?.data) ? myLeaves.data : [];
                        const pendingCount = leavesList.filter(l => l?.status === "PENDING" || l?.status === "BEKLEMEDE").length;

                        setStats(prev => ({
                            totalUsers: prev.totalUsers || 0,
                            totalVehicles: prev.totalVehicles || 0,
                            availableVehicles: prev.availableVehicles || 0,
                            pendingLeaveRequests: pendingCount
                        }));
                    }
                }
            } catch (err) {
                console.error("Dashboard verileri alınamadı:", err);
                if (isMounted) {
                    setErrorMessage("Gösterge paneli verileri yüklenirken bir sorun oluştu.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, [currentUserId]);

    const handlePhotoUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    const base64Photo = reader.result;
                    setUserProfile(prev => ({ ...prev, photo: base64Photo }));
                    if (currentUserId) {
                        localStorage.setItem(`user_photo_${currentUserId}`, base64Photo);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (currentUserId) {
            const savedPhoto = localStorage.getItem(`user_photo_${currentUserId}`);
            if (savedPhoto) {
                setUserProfile(prev => ({ ...prev, photo: savedPhoto }));
            }
        }
    }, [currentUserId]);

    if (loading) {
        return (
            <div className="container-fluid py-5 text-center text-muted" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
                <div className="spinner-border text-danger mb-2" role="status"></div>
                <div>Toyota Executive Portal Yükleniyor...</div>
            </div>
        );
    }

    const getInitial = () => {
        const name = userProfile?.fullName || "A";
        return name.trim().charAt(0).toUpperCase() || "A";
    };

    return (
        <div className="container-fluid py-4 text-start" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <div className="card bg-dark text-white border-0 shadow-sm mb-4" style={{ borderLeft: "6px solid #d6001c", borderRadius: "8px" }}>
                <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <span className="badge bg-danger text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "10px", backgroundColor: "#d6001c" }}>
                            Toyota Executive Portal
                        </span>
                        <h2 className="fw-bold mb-1">Hoş Geldiniz, {userProfile.fullName}</h2>
                        <p className="text-secondary small mb-3">
                            Toyota İnsan Kaynakları Yönetim Sistemi &bull; <strong className="text-light">{userProfile.department}</strong>
                        </p>
                        <div className="d-flex gap-2 flex-wrap">
                            <span className="badge bg-secondary text-light px-3 py-2 fw-semibold">
                                Sicil No: {userProfile.employeeNo}
                            </span>
                            <span className="badge bg-danger text-white px-3 py-2 fw-semibold" style={{ backgroundColor: "#d6001c" }}>
                                {userProfile.role}
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="position-relative d-inline-block">
                            {userProfile.photo ? (
                                <img
                                    src={userProfile.photo}
                                    alt="Profil"
                                    className="rounded-circle object-fit-cover border border-3 border-danger"
                                    style={{ width: "80px", height: "80px" }}
                                />
                            ) : (
                                <div
                                    className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm"
                                    style={{ width: "80px", height: "80px", backgroundColor: "#d6001c" }}
                                >
                                    {getInitial()}
                                </div>
                            )}
                            <label
                                htmlFor="photoInput"
                                className="position-absolute bottom-0 end-0 bg-white text-dark rounded-circle p-1 shadow-sm border border-secondary"
                                style={{ width: "26px", height: "26px", lineHeight: "16px", cursor: "pointer" }}
                                title="Fotoğraf Yükle"
                            >
                                <span style={{ fontSize: "12px", fontWeight: "bold" }}>+</span>
                            </label>
                            <input
                                type="file"
                                id="photoInput"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="d-none"
                            />
                        </div>
                        <span className="d-block text-secondary fs-7 mt-1" style={{ fontSize: "11px" }}>Profil Fotoğrafı</span>
                    </div>
                </div>
            </div>

            {errorMessage && <div className="alert alert-danger py-2 px-3 small mb-4">{errorMessage}</div>}

            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm border-start border-primary border-4 h-100" style={{ borderRadius: "8px" }}>
                        <div className="card-body">
                            <span className="text-uppercase text-muted fw-bold fs-7">Toplam Aktif Çalışan</span>
                            <h2 className="fw-bold text-dark my-1">{stats?.totalUsers || 0}</h2>
                            <span className="text-muted small">Şirket Geneli Kadro</span>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm border-start border-success border-4 h-100" style={{ borderRadius: "8px" }}>
                        <div className="card-body">
                            <span className="text-uppercase text-muted fw-bold fs-7">Müsait Şirket Araçları</span>
                            <h2 className="fw-bold text-success my-1">{stats?.availableVehicles || 0}</h2>
                            <span className="text-muted small">Filo Kullanıma Hazır</span>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm border-start border-danger border-4 h-100" style={{ borderRadius: "8px" }}>
                        <div className="card-body">
                            <span className="text-uppercase text-muted fw-bold fs-7">Bekleyen İzin Taleplerim</span>
                            <h2 className="fw-bold text-danger my-1" style={{ color: "#d6001c" }}>{stats?.pendingLeaveRequests || 0}</h2>
                            <span className="text-muted small">İK Onayı Bekliyor</span>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm border-start border-secondary border-4 h-100" style={{ borderRadius: "8px" }}>
                        <div className="card-body">
                            <span className="text-uppercase text-muted fw-bold fs-7">Toplam Şirket Aracı</span>
                            <h2 className="fw-bold text-dark my-1">{stats?.totalVehicles || 0}</h2>
                            <span className="text-muted small">Filo Envanteri</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: "8px", overflow: "hidden" }}>
                <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="fw-bold text-dark mb-0 fs-6 text-uppercase">Hızlı Aksiyon ve Süreç Portalı</h5>
                </div>
                <div className="card-body p-4">
                    {/* row g-3 ile kartları 4 sütunlu (col-md-3 veya col-lg-3) yerleştiriyoruz ki hepsi yan yana sığsın */}
                    <div className="row g-3">
                        <div className="col-md-6 col-lg-3">
                            <div className="card border h-100 bg-light" style={{ borderRadius: "8px" }}>
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold text-dark mb-0">İzin Başvurusu</h6>
                                            {(stats?.pendingLeaveRequests || 0) > 0 && (
                                                <span className="badge bg-danger text-white" style={{ backgroundColor: "#d6001c" }}>
                                                    {stats.pendingLeaveRequests} Bekliyor
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted small mb-3">Yıllık, mazeret veya sağlık izni taleplerinizi anında oluşturun.</p>
                                    </div>
                                    <a href="/leave-requests" className="btn btn-danger btn-sm fw-bold w-100" style={{ backgroundColor: "#d6001c", borderColor: "#d6001c" }}>
                                        Talep Oluştur &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* YENİ EKLENEN ARAÇ TALEBİ KARTI */}
                        <div className="col-md-6 col-lg-3">
                            <div className="card border h-100 bg-light" style={{ borderRadius: "8px", borderLeft: "4px solid #1e7e34" }}>
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="fw-bold text-dark mb-0">Araç Talebi</h6>
                                        </div>
                                        <p className="text-muted small mb-3">Şirket içi görevler veya şehir dışı operasyonlar için araç ayırtın.</p>
                                    </div>
                                    <a href="/vehicle-requests" className="btn btn-outline-dark btn-sm fw-bold w-100" style={{ borderColor: "#1e7e34", color: "#1e7e34" }}>
                                        Araç Ayırt &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card border h-100 bg-light" style={{ borderRadius: "8px" }}>
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <h6 className="fw-bold text-dark mb-2">Profil Güncelleme</h6>
                                        <p className="text-muted small mb-3">Adres, telefon veya IBAN bilgilerinizi İK onayına sunun.</p>
                                    </div>
                                    <a href="/update-requests" className="btn btn-outline-dark btn-sm fw-bold w-100">
                                        Bilgileri Düzenle &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card border h-100 bg-light" style={{ borderRadius: "8px" }}>
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <h6 className="fw-bold text-dark mb-2">Duyurular ve Bildirimler</h6>
                                        <p className="text-muted small mb-3">Şirket içi güncel gelişmeleri ve onay bildirimlerini takip edin.</p>
                                    </div>
                                    <a href="/notifications" className="btn btn-outline-dark btn-sm fw-bold w-100">
                                        Bildirimlere Git &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
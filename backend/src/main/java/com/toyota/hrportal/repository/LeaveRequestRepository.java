package com.toyota.hrportal.repository;

import com.toyota.hrportal.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    // Kullanıcının ID'sine göre izin taleplerini getirir
    List<LeaveRequest> findByUserId(Long userId);

    // EKLENECEK METOT: Duruma göre (PENDING, APPROVED vs.) izin sayısını döner
    long countByStatus(String status);

    // İhtiyaç varsa: Belirli bir kullanıcının duruma göre izin sayısı
    long countByUserIdAndStatus(Long userId, String status);
}
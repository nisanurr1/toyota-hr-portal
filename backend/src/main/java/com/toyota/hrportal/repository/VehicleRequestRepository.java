package com.toyota.hrportal.repository;

import com.toyota.hrportal.entity.VehicleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Gerekli import

public interface VehicleRequestRepository extends JpaRepository<VehicleRequest, Long> {
    
    // Kullanıcı ID'sine göre araç taleplerini getiren metot
    List<VehicleRequest> findByUserId(Long userId);
    
}
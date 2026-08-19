package com.toyota.hrportal.repository;

import com.toyota.hrportal.entity.UpdateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UpdateRequestRepository extends JpaRepository<UpdateRequest, Long> {
    // Sadece belirli bir kullanıcının güncelleme taleplerini getirir
    List<UpdateRequest> findByUserId(Long userId);
}
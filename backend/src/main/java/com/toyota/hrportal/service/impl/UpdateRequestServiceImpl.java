package com.toyota.hrportal.service.impl;

import com.toyota.hrportal.entity.UpdateRequest;
import com.toyota.hrportal.entity.User;
import com.toyota.hrportal.repository.UpdateRequestRepository;
import com.toyota.hrportal.repository.UserRepository;
import com.toyota.hrportal.service.UpdateRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UpdateRequestServiceImpl implements UpdateRequestService {

    private final UpdateRequestRepository repository;
    private final UserRepository userRepository;

    public UpdateRequestServiceImpl(UpdateRequestRepository repository,
                                    UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Override
    public List<UpdateRequest> getAllUpdateRequests() {
        return repository.findAll();
    }

    @Override
    public UpdateRequest getUpdateRequestById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public UpdateRequest saveUpdateRequest(UpdateRequest updateRequest) {
        return repository.save(updateRequest);
    }

    @Override
    public UpdateRequest updateUpdateRequest(Long id, UpdateRequest updateRequest) {
        UpdateRequest existing = repository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setFieldName(updateRequest.getFieldName());
        existing.setOldValue(updateRequest.getOldValue());
        existing.setNewValue(updateRequest.getNewValue());
        existing.setReason(updateRequest.getReason());
        existing.setStatus(updateRequest.getStatus());
        existing.setRequestDate(updateRequest.getRequestDate());
        existing.setUser(updateRequest.getUser());

        return repository.save(existing);
    }

    @Override
    public void deleteUpdateRequest(Long id) {
        repository.deleteById(id);
    }

    @Override
    public UpdateRequest approveByManager(Long id) {
        UpdateRequest request = repository.findById(id).orElse(null);

        if (request == null)
            return null;

        request.setStatus("MANAGER_APPROVED");

        return repository.save(request);
    }

    @Override
    public UpdateRequest rejectByManager(Long id) {
        UpdateRequest request = repository.findById(id).orElse(null);

        if (request == null)
            return null;

        request.setStatus("MANAGER_REJECTED");

        return repository.save(request);
    }

    @Override
    @Transactional
    public UpdateRequest approveByHr(Long id) {
        UpdateRequest request = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Talep bulunamadı ID: " + id));

        // 1. Talebin durumunu İK Onaylandı yapıyoruz
        request.setStatus("HR_APPROVED");

        // 2. İK Onayladığında veriyi asıl 'users' tablosunda güncelliyoruz
        User user = request.getUser();
        if (user != null) {
            String field = request.getFieldName();
            String newValue = request.getNewValue();

            if (field != null && newValue != null) {
                if ("Telefon Numarası".equalsIgnoreCase(field) || "phone".equalsIgnoreCase(field)) {
                    user.setPhone(newValue);
                } else if ("İkametgah Adresi".equalsIgnoreCase(field) || "address".equalsIgnoreCase(field)) {
                    user.setAddress(newValue);
                } else if ("Acil Durum Kişisi".equalsIgnoreCase(field) || "emergencyContactName".equalsIgnoreCase(field)) {
                    user.setEmergencyContactName(newValue);
                }

                // Kullanıcının güncellenmiş halini 'users' tablosuna kaydediyoruz
                userRepository.save(user);
            }
        }

        return repository.save(request);
    }

    @Override
    public UpdateRequest rejectByHr(Long id) {
        UpdateRequest request = repository.findById(id).orElse(null);

        if (request == null)
            return null;

        request.setStatus("HR_REJECTED");

        return repository.save(request);
    }

    @Override
    public List<UpdateRequest> getUpdateRequestsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }
}
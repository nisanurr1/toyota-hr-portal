package com.toyota.hrportal.service.impl;

import com.toyota.hrportal.entity.LeaveRequest;
import com.toyota.hrportal.repository.LeaveRequestRepository;
import com.toyota.hrportal.service.LeaveRequestService;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveRequestServiceImpl(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @Override
    public LeaveRequest getLeaveRequestById(Long id) {
        return leaveRequestRepository.findById(id).orElse(null);
    }

    public LeaveRequest calculateLeaveDays(LeaveRequest leaveRequest) {
        if (leaveRequest == null) {
            throw new IllegalArgumentException("İzin talebi boş olamaz.");
        }

        if (leaveRequest.getStartDate() == null || leaveRequest.getEndDate() == null) {
            throw new IllegalArgumentException("Başlangıç ve bitiş tarihleri zorunludur.");
        }

        if (leaveRequest.getReason() == null || leaveRequest.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("İzin açıklaması boş olamaz.");
        }

        LocalDate startDate = leaveRequest.getStartDate();
        LocalDate endDate = leaveRequest.getEndDate();

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }

        leaveRequest.setReason(leaveRequest.getReason().trim());
        leaveRequest.setTotalDays((int) (ChronoUnit.DAYS.between(startDate, endDate) + 1));
        return leaveRequest;
    }

    @Override
    public LeaveRequest saveLeaveRequest(LeaveRequest leaveRequest) {
        return leaveRequestRepository.save(calculateLeaveDays(leaveRequest));
    }

    @Override
    public LeaveRequest updateLeaveRequest(Long id, LeaveRequest leaveRequest) {
        LeaveRequest existing = leaveRequestRepository.findById(id).orElse(null);

        if (existing == null) {
            System.out.println("❌ Leave request not found: " + id);
            return null;
        }

        System.out.println("📝 Updating leave request " + id);
        System.out.println("   Before - Status: " + existing.getStatus() + ", User: " + (existing.getUser() != null ? existing.getUser().getId() : "NULL"));

        // Only update fields that are provided (non-null)
        if (leaveRequest.getStartDate() != null) {
            existing.setStartDate(leaveRequest.getStartDate());
            System.out.println("   Updated StartDate to: " + leaveRequest.getStartDate());
        }
        if (leaveRequest.getEndDate() != null) {
            existing.setEndDate(leaveRequest.getEndDate());
            System.out.println("   Updated EndDate to: " + leaveRequest.getEndDate());
        }
        if (leaveRequest.getReason() != null) {
            existing.setReason(leaveRequest.getReason());
        }
        if (leaveRequest.getStatus() != null) {
            existing.setStatus(leaveRequest.getStatus());
            System.out.println("   Updated Status to: " + leaveRequest.getStatus());
        }
        if (leaveRequest.getUser() != null) {
            existing.setUser(leaveRequest.getUser());
        }

        System.out.println("   After - Status: " + existing.getStatus() + ", User: " + (existing.getUser() != null ? existing.getUser().getId() : "NULL"));

        // Only recalculate leave days if dates were actually updated
        if (leaveRequest.getStartDate() != null || leaveRequest.getEndDate() != null) {
            System.out.println("   Recalculating leave days...");
            return leaveRequestRepository.save(calculateLeaveDays(existing));
        }

        System.out.println("   Saving without date recalculation...");
        return leaveRequestRepository.save(existing);
    }

    @Override
    public void deleteLeaveRequest(Long id) {
        leaveRequestRepository.deleteById(id);
    }

    @Override
    public List<LeaveRequest> getLeaveRequestsByUserId(Long userId) {
        return leaveRequestRepository.findByUserId(userId).stream()
                .filter(request -> request != null)
                .collect(Collectors.toList());
    }
}
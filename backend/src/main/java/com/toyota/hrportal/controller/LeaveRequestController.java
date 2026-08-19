package com.toyota.hrportal.controller;

import com.toyota.hrportal.entity.LeaveRequest;
import com.toyota.hrportal.service.LeaveRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin(origins = "*")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestService.getAllLeaveRequests();
    }

    @GetMapping("/{id}")
    public LeaveRequest getLeaveRequestById(@PathVariable Long id) {
        return leaveRequestService.getLeaveRequestById(id);
    }

    // Sadece TEK BİR TANİ /user/{userId} adresi bırakıyoruz
    @GetMapping("/user/{userId}")
    public List<LeaveRequest> getLeaveRequestsByUserId(@PathVariable Long userId) {
        return leaveRequestService.getLeaveRequestsByUserId(userId);
    }

    @PostMapping
    public LeaveRequest createLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        return leaveRequestService.saveLeaveRequest(leaveRequest);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeaveRequest(@PathVariable Long id, @RequestBody LeaveRequest leaveRequest) {
        try {
            System.out.println("🔵 UPDATE REQUEST: ID=" + id + ", Status=" + leaveRequest.getStatus() + 
                             ", StartDate=" + leaveRequest.getStartDate() + ", EndDate=" + leaveRequest.getEndDate());
            
            LeaveRequest updated = leaveRequestService.updateLeaveRequest(id, leaveRequest);
            if (updated == null) {
                System.out.println("❌ Leave request not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "İzin talebi bulunamadı.")
                );
            }
            System.out.println("✅ Leave request updated successfully: " + updated.getId());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Validation Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("message", e.getMessage())
            );
        } catch (Exception e) {
            System.err.println("❌ Unexpected Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("message", "Sunucu hatası: " + e.getMessage())
            );
        }
    }

    @DeleteMapping("/{id}")
    public void deleteLeaveRequest(@PathVariable Long id) {
        leaveRequestService.deleteLeaveRequest(id);
    }
}
package com.toyota.hrportal.service;

import com.toyota.hrportal.entity.LeaveRequest;

import java.util.List;

public interface LeaveRequestService {

    List<LeaveRequest> getAllLeaveRequests();

    LeaveRequest getLeaveRequestById(Long id);

    LeaveRequest saveLeaveRequest(LeaveRequest leaveRequest);

    LeaveRequest updateLeaveRequest(Long id, LeaveRequest leaveRequest);

    List<LeaveRequest> getLeaveRequestsByUserId(Long userId);
    void deleteLeaveRequest(Long id);
}
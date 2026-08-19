package com.toyota.hrportal.dto;

public class DashboardResponse {

    private Long totalUsers;
    private Long totalVehicles;
    private Long availableVehicles;
    private Long pendingLeaveRequests;

    public DashboardResponse() {
    }

    public DashboardResponse(Long totalUsers,
                             Long totalVehicles,
                             Long availableVehicles,
                             Long pendingLeaveRequests) {

        this.totalUsers = totalUsers;
        this.totalVehicles = totalVehicles;
        this.availableVehicles = availableVehicles;
        this.pendingLeaveRequests = pendingLeaveRequests;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(Long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public Long getAvailableVehicles() {
        return availableVehicles;
    }

    public void setAvailableVehicles(Long availableVehicles) {
        this.availableVehicles = availableVehicles;
    }

    public Long getPendingLeaveRequests() {
        return pendingLeaveRequests;
    }

    public void setPendingLeaveRequests(Long pendingLeaveRequests) {
        this.pendingLeaveRequests = pendingLeaveRequests;
    }
}
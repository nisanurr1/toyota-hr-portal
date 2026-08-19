package com.toyota.hrportal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String leaveType; // <-- EKLENDİ (Yıllık İzin, Mazeret İzni vs.)

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(length = 500)
    private String reason;

    private Integer totalDays;

    private String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"leaveRequests", "password"})
    @JsonIgnore
    private User user;

    public LeaveRequest() {
    }

    public Long getId() {
        return id;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
        calculateTotalDays();
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        calculateTotalDays();
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Otomatik iş günü/gün hesabı
    private void calculateTotalDays() {
        if (this.startDate != null && this.endDate != null) {
            long days = ChronoUnit.DAYS.between(this.startDate, this.endDate) + 1;
            this.totalDays = (int) (days > 0 ? days : 1);
        }
    }
}
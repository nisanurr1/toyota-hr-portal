package com.toyota.hrportal.controller;

import com.toyota.hrportal.dto.DashboardResponse;
import com.toyota.hrportal.service.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins="*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse dashboard() {

        return dashboardService.getDashboard();

    }

}
package com.toyota.hrportal.service.impl;

import com.toyota.hrportal.dto.DashboardResponse;
import com.toyota.hrportal.repository.LeaveRequestRepository;
import com.toyota.hrportal.repository.UserRepository;
import com.toyota.hrportal.repository.VehicleRepository;
import com.toyota.hrportal.service.DashboardService;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final LeaveRequestRepository leaveRepository;

    public DashboardServiceImpl(UserRepository userRepository,
                                VehicleRepository vehicleRepository,
                                LeaveRequestRepository leaveRepository) {

        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.leaveRepository = leaveRepository;
    }

    @Override
    public DashboardResponse getDashboard() {

        return new DashboardResponse(

                userRepository.count(),

                vehicleRepository.count(),

                vehicleRepository.countByAvailableTrue(),

                leaveRepository.countByStatus("PENDING")
        );
    }
}
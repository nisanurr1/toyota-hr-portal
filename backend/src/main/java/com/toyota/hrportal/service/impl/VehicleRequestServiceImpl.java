package com.toyota.hrportal.service.impl;

import com.toyota.hrportal.entity.VehicleRequest;
import com.toyota.hrportal.repository.VehicleRequestRepository;
import com.toyota.hrportal.service.VehicleRequestService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleRequestServiceImpl implements VehicleRequestService {

    private final VehicleRequestRepository vehicleRequestRepository;

    public VehicleRequestServiceImpl(VehicleRequestRepository vehicleRequestRepository) {
        this.vehicleRequestRepository = vehicleRequestRepository;
    }

    @Override
    public List<VehicleRequest> getAllVehicleRequests() {
        return vehicleRequestRepository.findAll();
    }

    @Override
    public VehicleRequest getVehicleRequestById(Long id) {
        return vehicleRequestRepository.findById(id).orElse(null);
    }

    @Override
    public VehicleRequest saveVehicleRequest(VehicleRequest vehicleRequest) {
        return vehicleRequestRepository.save(vehicleRequest);
    }

    @Override
    public VehicleRequest updateVehicleRequest(Long id, VehicleRequest vehicleRequest) {

        VehicleRequest existing = vehicleRequestRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setRequestDate(vehicleRequest.getRequestDate());
        existing.setUsageDate(vehicleRequest.getUsageDate());
        existing.setPurpose(vehicleRequest.getPurpose());
        existing.setStatus(vehicleRequest.getStatus());
        existing.setUser(vehicleRequest.getUser());
        existing.setVehicle(vehicleRequest.getVehicle());

        return vehicleRequestRepository.save(existing);
    }

    @Override
    public void deleteVehicleRequest(Long id) {
        vehicleRequestRepository.deleteById(id);
    }

    @Override
    public List<VehicleRequest> getVehicleRequestsByUserId(Long userId) {
        return vehicleRequestRepository.findByUserId(userId);
    }
}
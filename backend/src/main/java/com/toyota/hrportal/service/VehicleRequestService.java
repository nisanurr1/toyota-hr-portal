package com.toyota.hrportal.service;

import com.toyota.hrportal.entity.VehicleRequest;
import java.util.List;

public interface VehicleRequestService {

    List<VehicleRequest> getAllVehicleRequests();

    VehicleRequest getVehicleRequestById(Long id);

    VehicleRequest saveVehicleRequest(VehicleRequest vehicleRequest);

    VehicleRequest updateVehicleRequest(Long id, VehicleRequest vehicleRequest);

    void deleteVehicleRequest(Long id);

    // Sadece imza bırakıyoruz
    List<VehicleRequest> getVehicleRequestsByUserId(Long userId);
}
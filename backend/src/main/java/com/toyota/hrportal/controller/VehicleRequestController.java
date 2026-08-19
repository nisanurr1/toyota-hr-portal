package com.toyota.hrportal.controller;

import com.toyota.hrportal.entity.VehicleRequest;
import com.toyota.hrportal.service.VehicleRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-requests")
@CrossOrigin(origins = "*")
public class VehicleRequestController {

    private final VehicleRequestService vehicleRequestService;

    public VehicleRequestController(VehicleRequestService vehicleRequestService) {
        this.vehicleRequestService = vehicleRequestService;
    }

    @GetMapping
    public List<VehicleRequest> getAll() {
        return vehicleRequestService.getAllVehicleRequests();
    }

    // EKLENEN ENDPOINT: Çalışanın kendi ID'sine ait araç taleplerini getirir
    @GetMapping("/user/{userId}")
    public List<VehicleRequest> getByUserId(@PathVariable Long userId) {
        return vehicleRequestService.getVehicleRequestsByUserId(userId);
    }

    @GetMapping("/{id}")
    public VehicleRequest getById(@PathVariable Long id) {
        return vehicleRequestService.getVehicleRequestById(id);
    }

    @PostMapping
    public VehicleRequest save(@RequestBody VehicleRequest vehicleRequest) {
        return vehicleRequestService.saveVehicleRequest(vehicleRequest);
    }

    @PutMapping("/{id}")
    public VehicleRequest update(@PathVariable Long id,
                                   @RequestBody VehicleRequest vehicleRequest) {
        return vehicleRequestService.updateVehicleRequest(id, vehicleRequest);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        vehicleRequestService.deleteVehicleRequest(id);
    }
}
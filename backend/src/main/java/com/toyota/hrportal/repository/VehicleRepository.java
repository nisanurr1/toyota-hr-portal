package com.toyota.hrportal.repository;

import com.toyota.hrportal.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    long countByAvailableTrue();
}
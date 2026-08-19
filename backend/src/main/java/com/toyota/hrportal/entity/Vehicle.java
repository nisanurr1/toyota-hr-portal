package com.toyota.hrportal.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name="vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String brand;

    @Column(nullable=false)
    private String model;

    private String fuelType;

    private Integer year;

    private Boolean available;

    @OneToMany(mappedBy = "vehicle")
    @JsonIgnore
    private List<VehicleRequest> requests;

    public Vehicle(){}

    public Long getId() {
        return id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public List<VehicleRequest> getRequests() {
        return requests;
    }

    public void setRequests(List<VehicleRequest> requests) {
        this.requests = requests;
    }

    public Boolean isAvailable()
    {
        return available;
    }
}
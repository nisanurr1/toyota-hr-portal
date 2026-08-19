package com.toyota.hrportal.controller;

import com.toyota.hrportal.entity.Notification;
import com.toyota.hrportal.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> getAll(){
        return service.getAllNotifications();
    }

    @PostMapping
    public Notification save(@RequestBody Notification notification){
        return service.saveNotification(notification);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.deleteNotification(id);
    }
}
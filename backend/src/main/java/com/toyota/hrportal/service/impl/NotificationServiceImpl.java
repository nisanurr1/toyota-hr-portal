package com.toyota.hrportal.service.impl;

import com.toyota.hrportal.entity.Notification;
import com.toyota.hrportal.repository.NotificationRepository;
import com.toyota.hrportal.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    public NotificationServiceImpl(NotificationRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Notification> getAllNotifications() {
        return repository.findAll();
    }

    @Override
    public Notification saveNotification(Notification notification) {
        return repository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }
}
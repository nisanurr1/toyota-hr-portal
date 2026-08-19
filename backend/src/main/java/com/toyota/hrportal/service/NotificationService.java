package com.toyota.hrportal.service;

import com.toyota.hrportal.entity.Notification;
import java.util.List;

public interface NotificationService {

    List<Notification> getAllNotifications();

    Notification saveNotification(Notification notification);

    void deleteNotification(Long id);
}
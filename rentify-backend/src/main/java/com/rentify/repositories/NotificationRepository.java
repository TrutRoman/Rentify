package com.rentify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rentify.models.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Шукаємо сповіщення для конкретної ролі, сортуючи від найновіших до найстаріших
    List<Notification> findByRecipientRoleOrderByIdDesc(String recipientRole);
}
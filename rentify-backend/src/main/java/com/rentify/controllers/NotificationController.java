package com.rentify.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rentify.models.Notification;
import com.rentify.repositories.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 1. ЗБЕРЕГТИ в базу і ВІДПРАВИТИ по WebSocket
    @PostMapping("/send")
    public void sendNotification(@RequestParam String topic, @RequestBody String message) {
        // Витягуємо роль з топіка (наприклад: /topic/manager -> MANAGER)
        String role = topic.replace("/topic/", "").toUpperCase();
        String cleanMessage = message.replace("\"", "");

        // Зберігаємо в MySQL
        Notification notification = new Notification();
        notification.setRecipientRole(role);
        notification.setMessage(cleanMessage);
        notificationRepository.save(notification);

        // Відправляємо онлайн-користувачам
        messagingTemplate.convertAndSend(topic, cleanMessage);
    }

    // 2. ОТРИМАТИ історію сповіщень з бази
    @GetMapping("/{role}")
    public List<Notification> getHistory(@PathVariable String role) {
        return notificationRepository.findByRecipientRoleOrderByIdDesc(role.toUpperCase());
    }

    // 3. ОЧИСТИТИ історію (коли користувач тисне "Очистити все")
    @DeleteMapping("/clear/{role}")
    public void clearHistory(@PathVariable String role) {
        List<Notification> notifs = notificationRepository.findByRecipientRoleOrderByIdDesc(role.toUpperCase());
        notificationRepository.deleteAll(notifs);
    }
}
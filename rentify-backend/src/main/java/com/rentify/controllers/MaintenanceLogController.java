package com.rentify.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rentify.models.InventoryItem;
import com.rentify.models.MaintenanceLog;
import com.rentify.repositories.InventoryRepository;
import com.rentify.repositories.MaintenanceLogRepository;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceLogController {

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @PostMapping("/create")
    public MaintenanceLog createLog(
            @RequestParam Long itemId,
            @RequestParam(required = false, defaultValue = "Плановий технічний огляд") String description) {
        
        InventoryItem item = inventoryRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Предмет не знайдено"));
        
        item.setStatus("MAINTENANCE");
        inventoryRepository.save(item);

        MaintenanceLog log = new MaintenanceLog();
        log.setInventoryItem(item);
        log.setIssueDescription(description);
        
        log.setTechId(6L); // Припустимо, що технік з ID 6 існує в базі даних
        
        return maintenanceLogRepository.save(log);
    }

    @GetMapping("/active")
    public List<MaintenanceLog> getActiveLogs() {
        return maintenanceLogRepository.findByStatusOrderByIdDesc("IN_PROGRESS");
    }

    // ОНОВЛЕНО: Тепер приймаємо finalComment через @RequestParam
    @PutMapping("/{id}/resolve")
    public MaintenanceLog resolveLog(@PathVariable Long id, @RequestParam Double cost, @RequestParam(required = false) String finalComment) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запис ТО не знайдено"));
        
        log.setCost(cost);
        log.setStatus("RESOLVED");
        if (finalComment != null && !finalComment.trim().isEmpty()) {
            log.setIssueDescription(log.getIssueDescription() + " | Вирішено: " + finalComment);
        }

        InventoryItem item = log.getInventoryItem();
        if (item != null) {
            item.setStatus("AVAILABLE");
            inventoryRepository.save(item);
        }

        return maintenanceLogRepository.save(log);
    }
}
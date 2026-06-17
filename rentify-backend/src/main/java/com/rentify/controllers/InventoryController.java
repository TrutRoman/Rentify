package com.rentify.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rentify.models.InventoryItem;
import com.rentify.repositories.InventoryRepository;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping("/available")
    public List<InventoryItem> getAvailableItems() {
        return inventoryRepository.findByStatus("AVAILABLE");
    }

    // 1. Отримати все майно, яке зараз на СТО
    @GetMapping("/maintenance")
    public List<InventoryItem> getMaintenanceItems() {
        return inventoryRepository.findByStatus("MAINTENANCE");
    }

    @PostMapping("/add")
    public InventoryItem addItem(@RequestBody InventoryItem item) {
        // Якщо предмет створюється, за замовчуванням він доступний
        item.setStatus("AVAILABLE");
        return inventoryRepository.save(item);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (!inventoryRepository.existsById(id)) {
            return org.springframework.http.ResponseEntity.badRequest().body("Предмет не знайдено!");
        }
        inventoryRepository.deleteById(id);
        return org.springframework.http.ResponseEntity.ok("Предмет успішно видалено");
    }

    // 2. Відремонтувати майно (змінити статус назад на AVAILABLE)
    @PutMapping("/{id}/repair")
    public InventoryItem repairItem(@PathVariable Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Майно не знайдено"));

        item.setStatus("AVAILABLE");
        InventoryItem savedItem = inventoryRepository.save(item);

        // Відправляємо саме в канал для менеджерів
        messagingTemplate.convertAndSend("/topic/manager", 
            "Увага! Технік щойно полагодив майно: " + savedItem.getName());

        return savedItem;
    }

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
}
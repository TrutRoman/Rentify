package com.rentify.controllers;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rentify.dto.FinancialReport;
import com.rentify.dto.RentalStats;
import com.rentify.models.DamageReport;
import com.rentify.models.InventoryItem;
import com.rentify.models.RentalOrder;
import com.rentify.repositories.DamageRepository;
import com.rentify.repositories.InventoryRepository;
import com.rentify.repositories.OrderRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private DamageRepository damageRepository;

    @GetMapping("/financial-report")
    public FinancialReport getFinancialReport() {
        // Рахуємо дохід (припустимо, статус COMPLETED)
        BigDecimal revenue = orderRepository.findAll().stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()))
                .map(RentalOrder::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Рахуємо штрафи
        BigDecimal penalties = damageRepository.findAll().stream()
                .map(com.rentify.models.DamageReport::getPenaltyAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeOrders = orderRepository.findAll().stream()
                .filter(o -> "ACTIVE".equals(o.getStatus()))
                .count();

        return new FinancialReport(revenue, penalties, activeOrders);
    }

    @PostMapping("/{orderId}/report-damage")
    public DamageReport reportDamage(@PathVariable Long orderId, @RequestBody DamageReport report) {
        RentalOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Замовлення не знайдено"));
        
        // Встановлюємо зв'язок
        report.setRentalOrder(order);
        
        // Можна також змінити статус майна на "MAINTENANCE" (на ремонті), як ти описував у звіті
        InventoryItem item = order.getInventoryItem();
        item.setStatus("MAINTENANCE");
        inventoryRepository.save(item);
        
        return damageRepository.save(report);
    }

    @PostMapping("/create")
    public RentalOrder createOrder(@RequestBody RentalOrder order) {
        // 1. Знаходимо предмет
        InventoryItem item = inventoryRepository.findById(order.getInventoryItem().getId())
                .orElseThrow(() -> new RuntimeException("Item not found"));
                
        // 2. Ставимо статус "В оренді"
        item.setStatus("RENTED");
        
        // 3. Прив'язуємо предмет до замовлення
        order.setInventoryItem(item);
        
        // 4. СПОЧАТКУ зберігаємо замовлення, щоб база даних присвоїла йому ID
        RentalOrder savedOrder = orderRepository.save(order);
        
        // 5. ТЕПЕР, коли ми маємо ID замовлення (savedOrder.getId()), оновлюємо предмет
        item.setActiveOrderId(savedOrder.getId());
        inventoryRepository.save(item); // Зберігаємо зміни в предметі
        
        // 6. Повертаємо збережене замовлення
        return savedOrder;
    }

    @GetMapping("/client/{clientId}")
    public List<RentalOrder> getClientOrders(@PathVariable Long clientId) {
        return orderRepository.findAll().stream()
                // Фільтруємо замовлення так, щоб ID клієнта збігався із запитуваним
                .filter(order -> order.getClientId() != null && order.getClientId().equals(clientId))
                .toList();
    }

    // Метод для оформлення повернення
    @PutMapping("/{orderId}/return")
    public RentalOrder returnOrder(@PathVariable Long orderId) {
        // Знаходимо замовлення
        RentalOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Замовлення не знайдено"));

        // Змінюємо статус замовлення на Завершено
        order.setStatus("COMPLETED");

        // Змінюємо статус самого майна назад на Доступно
        InventoryItem item = order.getInventoryItem();
        if (item != null) {
            item.setStatus("AVAILABLE");
            inventoryRepository.save(item);
        }

        // Зберігаємо оновлене замовлення
        return orderRepository.save(order);
    }

    @GetMapping("/item/{itemId}/booked-dates")
    public List<String> getBookedDates(@PathVariable Long itemId) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getInventoryItem() != null && order.getInventoryItem().getId().equals(itemId))
                .filter(order -> "ACTIVE".equals(order.getStatus())) // Беремо тільки ті, що зараз в оренді
                .filter(order -> order.getStartTime() != null)
                .map(order -> order.getStartTime().toString().substring(0, 10)) // Обрізаємо до формату YYYY-MM-DD
                .distinct()
                .toList();
    }

    // 1. Отримати всі замовлення для Менеджера
    @GetMapping("/all")
    public List<RentalOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    // 2. Змінити статус замовлення (Схвалити, Відхилити, Завершити)
    @PutMapping("/{id}/status")
    public RentalOrder updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        RentalOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Замовлення не знайдено"));
        
        // Очищаємо статус від лапок, якщо фронтенд надіслав його як JSON-рядок
        order.setStatus(status.replace("\"", "")); 
        return orderRepository.save(order);
    }

    @GetMapping("/stats")
    public List<RentalStats> getStatistics() {
        return orderRepository.getRentalStatistics();
    }
}
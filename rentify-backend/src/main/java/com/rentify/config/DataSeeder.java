package com.rentify.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.rentify.models.InventoryItem;
import com.rentify.models.User;
import com.rentify.repositories.InventoryRepository;
import com.rentify.repositories.UserRepository; 

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, InventoryRepository inventoryRepository) {
        return args -> {
            // --- 1. СТВОРЕННЯ КОРИСТУВАЧІВ ---
            boolean adminExists = userRepository.findAll().stream()
                    .anyMatch(u -> "ADMIN".equals(u.getRole()));

            if (!adminExists) {
                User admin = new User();
                admin.setFullName("Головний Адміністратор");
                admin.setPhone("admin");
                admin.setPassword("admin123");
                admin.setRole("ADMIN");
                admin.setIsBlocked(false);
                admin.setRating(5.0);
                userRepository.save(admin);
                System.out.println("✅ Системного Адміністратора створено: admin / admin123");
            }
            
            boolean managerExists = userRepository.findAll().stream()
                    .anyMatch(u -> "MANAGER".equals(u.getRole()));
                    
            if (!managerExists) {
                User manager = new User();
                manager.setFullName("Менеджер Відділу");
                manager.setPhone("manager");
                manager.setPassword("manager123");
                manager.setRole("MANAGER");
                manager.setIsBlocked(false);
                manager.setRating(5.0);
                userRepository.save(manager);
                System.out.println("✅ Системного Менеджера створено: manager / manager123");
            }

            boolean techExists = userRepository.findAll().stream()
                    .anyMatch(u -> "TECH".equals(u.getRole()));

            if (!techExists) {
                User tech = new User();
                tech.setFullName("Технічний Спеціаліст");
                tech.setPhone("tech");
                tech.setPassword("tech123");
                tech.setRole("TECH");
                tech.setIsBlocked(false);
                tech.setRating(5.0);
                userRepository.save(tech);
                System.out.println("✅ Системного Техніка створено: tech / tech123");
            }

            // --- 2. СТВОРЕННЯ ПОШКОДЖЕНИХ ПРЕДМЕТІВ ДЛЯ ТЕХНІКА ---
            
            // Перший пошкоджений предмет (Самокат)
            boolean brokenItem1Exists = inventoryRepository.findAll().stream()
                    .anyMatch(item -> "SN-BROKEN-99".equals(item.getSerialNumber()));

            if (!brokenItem1Exists) {
                InventoryItem broken1 = new InventoryItem();
                broken1.setName("Електросамокат Xiaomi (Потребує ТО)");
                broken1.setSerialNumber("SN-BROKEN-99");
                broken1.setPricePerHour(120.0);
                broken1.setPricePerDay(1000.0); // Тепер помилки не буде!
                broken1.setType("VEHICLE");
                broken1.setImageUrl("default.jpg");
                broken1.setStatus("MAINTENANCE"); 
                
                inventoryRepository.save(broken1);
                System.out.println("🛠️ Створено перший пошкоджений предмет: Самокат");
            }

            // Другий пошкоджений предмет (Велосипед)
            boolean brokenItem2Exists = inventoryRepository.findAll().stream()
                    .anyMatch(item -> "SN-BROKEN-100".equals(item.getSerialNumber()));

            if (!brokenItem2Exists) {
                InventoryItem broken2 = new InventoryItem();
                broken2.setName("Велосипед гірський Trek (Пробите колесо)");
                broken2.setSerialNumber("SN-BROKEN-100");
                broken2.setPricePerHour(80.0);
                broken2.setPricePerDay(600.0); // Знижка на день
                broken2.setType("VEHICLE");
                broken2.setImageUrl("default.jpg");
                broken2.setStatus("MAINTENANCE"); 
                
                inventoryRepository.save(broken2);
                System.out.println("🛠️ Створено другий пошкоджений предмет: Велосипед");
            }

            // --- ОНОВЛЕННЯ СТАРИХ ЗАПИСІВ (МІГРАЦІЯ) ---
            java.util.List<InventoryItem> allItems = inventoryRepository.findAll();
            boolean needsUpdate = false;

            for (InventoryItem item : allItems) {
                // Якщо у старого майна немає подобової ціни
                if (item.getPricePerDay() == null) {
                    // Рахуємо її: ціна за годину * 10
                    item.setPricePerDay(item.getPricePerHour() * 10);
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                inventoryRepository.saveAll(allItems);
                System.out.println("🔄 Міграція успішна: всім старим записам додано pricePerDay!");
            }
        };
    }
}
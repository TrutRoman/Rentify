package com.rentify.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rentify.models.User;
import com.rentify.repositories.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerClient(@RequestBody User user) {
        // Очищаємо телефон від випадкових пробілів
        if (user.getPhone() != null) {
            user.setPhone(user.getPhone().trim());
        }
        
        // 1. Перевіряємо, чи вже є такий номер в базі
        if (userRepository.existsByPhone(user.getPhone())) {
            return ResponseEntity.badRequest().body("Цей номер телефону вже зареєстровано!");
        }

        // 2. Якщо номера немає, продовжуємо реєстрацію
        user.setRole("CLIENT");
        
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("1234"); 
        }
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/clients")
    public List<User> getAllClients() {
        return userRepository.findAll().stream()
                .filter(u -> "CLIENT".equals(u.getRole()))
                .toList();
    }

    @PutMapping("/{id}/block")
    public User blockUser(@PathVariable Long id, @RequestBody boolean isBlocked) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Користувач не знайдений"));
        
        user.setIsBlocked(isBlocked);
        return userRepository.save(user);
    }

    // Оновлення рейтингу клієнта (UC10)
    @PutMapping("/{id}/rating")
    public User updateRating(@PathVariable Long id, @RequestBody Double newRating) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено"));
        
        user.setRating(newRating); 
        return userRepository.save(user);
    }
}
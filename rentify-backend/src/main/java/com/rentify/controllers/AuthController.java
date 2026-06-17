package com.rentify.controllers;

import com.rentify.models.User;
import com.rentify.repositories.UserRepository;
import com.rentify.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // Спеціальний клас для прийому даних з React
    public static class LoginRequest {
        public String phone;
        public String password;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        // Шукаємо користувача в БД
        User user = userRepository.findByPhone(request.phone)
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено"));

        // Перевіряємо пароль (поки без шифрування BCrypt для простоти MVP)
        if (!user.getPassword().equals(request.password)) {
            throw new RuntimeException("Невірний пароль");
        }

        // Якщо все ок — генеруємо токен
        String token = jwtUtil.generateToken(user.getPhone(), user.getRole());

        // Відправляємо токен і дані користувача на фронтенд
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("fullName", user.getFullName());
        return response;
    }
}
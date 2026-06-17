package com.rentify.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    // Секретний ключ для шифрування (в реальних проєктах його ховають у налаштуваннях)
    private static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    // Токен діє 24 години
    private static final long EXPIRATION_TIME = 86400000; 

    public String generateToken(String phone, String role) {
        return Jwts.builder()
                .setSubject(phone)
                .claim("role", role) // Вшиваємо роль прямо в токен
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }
}
package com.rentify.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) 
            .csrf(csrf -> csrf.disable())
                        .cors(Customizer.withDefaults()) 
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Це в тебе вже має бути
                .requestMatchers("/api/inventory/**").permitAll()
                .requestMatchers("/api/notifications/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/orders/**").permitAll()
                .requestMatchers("/api/maintenance/**").permitAll()
                .requestMatchers("/api/finance/**").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
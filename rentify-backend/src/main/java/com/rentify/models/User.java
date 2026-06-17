package com.rentify.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String phone;

    // (пароль для входу)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // CLIENT, MANAGER, TECH, ADMIN    

    private Double rating = 5.0;
    private Boolean isBlocked = false;
}
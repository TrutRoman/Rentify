package com.rentify.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rentify.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
}
package com.rentify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rentify.models.InventoryItem;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    // Пошук майна за його статусом
    List<InventoryItem> findByStatus(String status);
}
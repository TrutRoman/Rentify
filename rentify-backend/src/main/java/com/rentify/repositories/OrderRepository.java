package com.rentify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository; // Не забудь імпортувати DTO
import org.springframework.data.jpa.repository.Query;

import com.rentify.dto.RentalStats;
import com.rentify.models.RentalOrder;

public interface OrderRepository extends JpaRepository<RentalOrder, Long> {
    List<RentalOrder> findByClientId(Long clientId);

    // ДОДАЄМО ЦЕ: Збираємо статистику популярності
    @Query("SELECT new com.rentify.dto.RentalStats(i.name, COUNT(o)) " +
           "FROM RentalOrder o JOIN o.inventoryItem i " +
           "GROUP BY i.name")
    List<RentalStats> getRentalStatistics();
}
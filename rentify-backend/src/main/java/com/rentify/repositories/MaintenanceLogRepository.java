package com.rentify.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rentify.models.MaintenanceLog;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByStatusOrderByIdDesc(String status);
}
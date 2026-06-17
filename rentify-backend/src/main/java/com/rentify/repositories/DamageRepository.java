package com.rentify.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rentify.models.DamageReport;

public interface DamageRepository extends JpaRepository<DamageReport, Long> {
}
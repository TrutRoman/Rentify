package com.rentify.models;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "damage_reports")
public class DamageReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String damageDescription;
    private BigDecimal penaltyAmount;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private RentalOrder rentalOrder; // Зв'язок з конкретним замовленням
}
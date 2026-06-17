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
@Table(name = "inventory_items")
public class InventoryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String serialNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // VEHICLE, EQUIPMENT

    @Column(nullable = false)
    private String status; // AVAILABLE, RENTED, IN_REPAIR, DECOMMISSIONED

    @Column(columnDefinition = "TEXT")
    private String description;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    @Column(nullable = false)
    private Double pricePerHour;

    @Column(name = "price_per_day")
    private Double pricePerDay;

    // Геттер та сеттер
    public Double getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(Double pricePerDay) { this.pricePerDay = pricePerDay; }

    @Column
    private Long activeOrderId;

    // Шлях до картинки
    @Column
    private String imageUrl;
}
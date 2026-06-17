package com.rentify.dto;

public class RentalStats {
    private String itemName;
    private Long rentCount;

    public RentalStats(String itemName, Long rentCount) {
        this.itemName = itemName;
        this.rentCount = rentCount;
    }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public Long getRentCount() { return rentCount; }
    public void setRentCount(Long rentCount) { this.rentCount = rentCount; }
}
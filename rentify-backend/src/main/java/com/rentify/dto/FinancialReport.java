package com.rentify.dto;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FinancialReport {
    private BigDecimal totalRevenue;
    private BigDecimal totalPenalties;
    private Long activeOrders;
}
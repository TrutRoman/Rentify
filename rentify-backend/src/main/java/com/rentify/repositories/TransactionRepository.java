package com.rentify.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rentify.models.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {}
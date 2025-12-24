package com.royalgrace.cards.dto;

public record CartItemResponse(
        String cardId,
        String name,
        double price,
        int quantity
) {}

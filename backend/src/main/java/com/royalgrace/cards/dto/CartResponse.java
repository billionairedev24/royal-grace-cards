package com.royalgrace.cards.dto;


import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        int totalItems,
        double subtotal
) {}

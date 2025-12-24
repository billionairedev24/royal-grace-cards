package com.royalgrace.cards.dto;


import com.royalgrace.cards.model.Order;

public record UpdateOrderStatusRequest(
        Order.PaymentStatus paymentStatus,
        Order.FulfillmentStatus fulfillmentStatus
) {
}

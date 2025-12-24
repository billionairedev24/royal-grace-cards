package com.royalgrace.cards.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class QRCodeRequest {
    // Getters and Setters
    private String orderId;
    private BigDecimal amount;
    private String paymentMethod;

    public QRCodeRequest(String orderId, BigDecimal amount, String paymentMethod) {
        this.orderId = orderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

}

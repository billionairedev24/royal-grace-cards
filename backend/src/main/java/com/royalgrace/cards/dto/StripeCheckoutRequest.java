package com.royalgrace.cards.dto;

import lombok.Getter;
import lombok.Setter;


@Setter
@Getter
public class StripeCheckoutRequest {
    // Getters and Setters
    private String orderId;
    private Double amount;
    private String successUrl;
    private String cancelUrl;

    public StripeCheckoutRequest(String orderId, Double amount, String successUrl, String cancelUrl) {
        this.orderId = orderId;
        this.amount = amount;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
    }

}

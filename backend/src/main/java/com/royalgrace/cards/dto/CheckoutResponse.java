package com.royalgrace.cards.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class CheckoutResponse {
    // Getters and Setters
    private String checkoutUrl;
    private String sessionId;
    private boolean success;
    private String message;

}

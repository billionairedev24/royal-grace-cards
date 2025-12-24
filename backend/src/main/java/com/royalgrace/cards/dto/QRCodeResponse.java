package com.royalgrace.cards.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Setter
@Getter
public class QRCodeResponse {
    // Getters and Setters
    private Map<String, String> qrCodes; // payment method -> base64 QR code image
    private Double amount;
    private String orderId;

    public QRCodeResponse(Map<String, String> qrCodes, Double amount, String orderId) {
        this.qrCodes = qrCodes;
        this.amount = amount;
        this.orderId = orderId;
    }

}

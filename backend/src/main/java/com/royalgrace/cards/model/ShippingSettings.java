package com.royalgrace.cards.model;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class ShippingSettings {
    // Getters and Setters
    private int freeShippingThreshold; // Number of cards for free shipping (default: 20)
    private BigDecimal standardShippingFee;

    // Constructors
    public ShippingSettings() {
        this.freeShippingThreshold = 20;
        this.standardShippingFee = BigDecimal.valueOf(5.00);
    }

    public ShippingSettings(int freeShippingThreshold, BigDecimal standardShippingFee) {
        this.freeShippingThreshold = freeShippingThreshold;
        this.standardShippingFee = standardShippingFee;
    }

}

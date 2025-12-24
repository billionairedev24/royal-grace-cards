package com.royalgrace.cards.dto;
import lombok.Data;
import java.util.List;

@Data
public class CheckoutRequest {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private ShippingAddressDto shippingAddress;
    private List<CheckoutItemDto> items;
    private Double shippingFee;
    private PaymentMethod paymentMethod;

    public enum PaymentMethod {
        STRIPE, ZELLE, CASHAPP
    }
}


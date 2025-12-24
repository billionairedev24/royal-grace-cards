package com.royalgrace.cards.dto;

import lombok.Data;

@Data
public class ShippingAddressDto {
    private String street;
    private String city;
    private String state;
    private String zipCode;
}
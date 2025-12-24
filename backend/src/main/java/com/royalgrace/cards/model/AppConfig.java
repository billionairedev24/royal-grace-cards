package com.royalgrace.cards.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private double standardShippingFee;
    
    private int freeShippingThreshold;

    private boolean stripeEnabled;

    private boolean zelleEnabled;

    private boolean cashappEnabled;

    private String zelleEmail;

    private String cashappHandle;

    private String zellePhone;



    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void setZ() {
    }
}

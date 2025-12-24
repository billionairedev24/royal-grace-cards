package com.royalgrace.cards.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String customerName;
    
    @Column(nullable = false)
    private String customerEmail;
    
    private String customerPhone;

    @Column(name = "cart_session_id", nullable = false, updatable = false)
    private String cartSessionId;

    @Column(name = "payment_session_id", nullable = true)
    private String paymentSessionId;

    @Embedded
    private ShippingAddress shippingAddress;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
    
    @Column(nullable = false)
    private Double subtotal;
    
    @Column(nullable = false)
    private Double shippingFee;
    
    @Column(nullable = false)
    private Double total;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FulfillmentStatus fulfillmentStatus = FulfillmentStatus.PENDING;
    
    private String trackingCode;
    
    @Column(length = 1000)
    private String shippingNotes;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrackingUpdate> trackingUpdates = new ArrayList<>();
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PaymentMethod {
        STRIPE, ZELLE, CASHAPP
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED
    }

    public enum FulfillmentStatus {
        PENDING, PROCESSING, SHIPPED, DELIVERED
    }
}

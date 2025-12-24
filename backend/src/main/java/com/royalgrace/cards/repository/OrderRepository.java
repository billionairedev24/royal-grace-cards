package com.royalgrace.cards.repository;

import com.royalgrace.cards.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    
    List<Order> findByCustomerEmail(String customerEmail);
    
    List<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus);
    
    List<Order> findByFulfillmentStatus(Order.FulfillmentStatus fulfillmentStatus);
    
    List<Order> findByPaymentStatusAndFulfillmentStatus(
        Order.PaymentStatus paymentStatus, 
        Order.FulfillmentStatus fulfillmentStatus
    );
    
    List<Order> findByOrderByCreatedAtDesc();

    Order findOrderByPaymentSessionId(String paymentSessionId);
}

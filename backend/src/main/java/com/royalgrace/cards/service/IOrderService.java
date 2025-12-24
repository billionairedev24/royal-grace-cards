package com.royalgrace.cards.service;

import com.royalgrace.cards.dto.UpdateOrderStatusRequest;
import com.royalgrace.cards.model.Order;
import com.royalgrace.cards.model.TrackingUpdate;
import java.util.List;
import java.util.Optional;

public interface IOrderService {
    
    List<Order> getAllOrders();
    
    Optional<Order> getOrderById(String id);
    
    List<Order> getOrdersByCustomerEmail(String email);
    
    List<Order> getOrdersByPaymentStatus(Order.PaymentStatus status);
    
    List<Order> getOrdersByFulfillmentStatus(Order.FulfillmentStatus status);
    
    List<Order> getPendingFulfillmentOrders();
    
    Order createOrder(Order order) throws Exception;
    
    Order updateOrder(String id, Order order);
    
    Order updateOrderStatus(String id, UpdateOrderStatusRequest request);
    
    Order updateOrderTracking(String id, String trackingCode, List<TrackingUpdate> updates);
    
    void deleteOrder(String id);
    
    boolean existsById(String id);

    void decrementInventory(String orderId);

    void sendOrderConfirmationEmail(String orderId, String customerEmail);

    void sendPaymentFailureEmail(String orderId, String customerEmail, String reason);

    void handleRefund(String paymentIntentId, Long refundedAmount);

    Order findOrdersByPaymentSessionId(String paymentSessionId);
}

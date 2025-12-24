package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.dto.UpdateOrderStatusRequest;
import com.royalgrace.cards.model.AppConfig;
import com.royalgrace.cards.model.Card;
import com.royalgrace.cards.model.Order;
import com.royalgrace.cards.model.OrderItem;
import com.royalgrace.cards.model.TrackingUpdate;
import com.royalgrace.cards.repository.CardRepository;
import com.royalgrace.cards.repository.OrderRepository;
import com.royalgrace.cards.service.IConfigService;
import com.royalgrace.cards.service.IOrderService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@Transactional
public class OrderServiceImpl implements IOrderService {

    private final OrderRepository orderRepository;
    private final CardRepository cardRepository;
    private final IConfigService configService;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, CardRepository cardRepository, IConfigService configService) {
        this.orderRepository = orderRepository;
        this.cardRepository = cardRepository;
        this.configService = configService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomerEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByPaymentStatus(Order.PaymentStatus status) {
        return orderRepository.findByPaymentStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByFulfillmentStatus(Order.FulfillmentStatus status) {
        return orderRepository.findByFulfillmentStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getPendingFulfillmentOrders() {
        return orderRepository.findByPaymentStatusAndFulfillmentStatus(
            Order.PaymentStatus.COMPLETED,
            Order.FulfillmentStatus.PENDING
        );
    }

    @Override
    @Transactional
    public Order createOrder(Order order) throws Exception {

        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        if (order.getPaymentMethod() == null) {
            throw new IllegalArgumentException("Payment method is required");
        }

        double subtotal = 0.0;

        // 🔒 Validate & enrich items
        for (OrderItem item : order.getItems()) {

            if (item.getCard() == null || item.getCard().getId() == null) {
                throw new IllegalArgumentException("Order item must reference a card");
            }

            var card = cardRepository.findById(item.getCard().getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Card not found: " + item.getCard().getId())
                    );

            int quantity = getQuantity(item, card);

            // 🔑 Lock values
            item.setOrder(order);
            item.setCard(card);
            item.setPriceAtPurchase(card.getPrice());

            subtotal += card.getPrice() * quantity;
        }

        // 🔑 Enforce required monetary fields
        order.setSubtotal(subtotal);

        // 🚚 Shipping logic from config
        double shippingFee = calculateShippingFee(order.getItems());
        order.setShippingFee(shippingFee);

        order.setTotal(subtotal + shippingFee);

        // 🔑 Force correct states (ignore UI tampering)
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setFulfillmentStatus(Order.FulfillmentStatus.PENDING);

        return orderRepository.save(order);
    }

    private double calculateShippingFee(List<OrderItem> items) throws Exception {
        AppConfig config = configService.getConfig();
        if(Objects.isNull(config)) {
            throw new Exception("App config is null");
        }

        double sum = items.stream()
                .mapToDouble(item -> item.getPriceAtPurchase() * item.getQuantity())
                .sum();
        if(sum >= config.getFreeShippingThreshold()){
            return 0.0;
        }

        return config.getStandardShippingFee();
    }

    private static int getQuantity(OrderItem item, Card card) {
        int quantity = item.getQuantity() != null ? item.getQuantity() : 0;

        if (quantity <= 0) {
            throw new IllegalArgumentException("Invalid quantity for " + card.getName());
        }

        int availableInventory = card.getInventory() != null ? card.getInventory() : 0;

        if (availableInventory < quantity) {
            throw new IllegalStateException(
                    "Insufficient inventory for " + card.getName()
            );
        }
        return quantity;
    }

    @Override
    public Order updateOrder(String id, Order order) {
        if (!orderRepository.existsById(id)) {
            throw new IllegalArgumentException("Order not found with id: " + id);
        }
        order.setId(id);
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrderStatus(
            String orderId,
            UpdateOrderStatusRequest request
    ) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (request.paymentStatus() != null) {
            order.setPaymentStatus(request.paymentStatus());
        }

        if (request.fulfillmentStatus() != null) {
            order.setFulfillmentStatus(request.fulfillmentStatus());
        }

        return orderRepository.save(order);
    }

    @Override
    public Order updateOrderTracking(String id, String trackingCode, List<TrackingUpdate> updates) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));

        order.setTrackingCode(trackingCode);
        if (updates != null && !updates.isEmpty()) {
            order.setTrackingUpdates(updates);
        }

        return orderRepository.save(order);
    }

    @Override
    public void deleteOrder(String id) {
        if (!orderRepository.existsById(id)) {
            throw new IllegalArgumentException("Order not found with id: " + id);
        }
        orderRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return orderRepository.existsById(id);
    }

    @Override
    public void decrementInventory(String orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getCard() != null) {
                    com.royalgrace.cards.model.Card card = item.getCard();
                    int currentInventory = card.getInventory() != null ? card.getInventory() : 0;
                    int quantityToDecrement = item.getQuantity() != null ? item.getQuantity() : 0;
                    card.setInventory(Math.max(0, currentInventory - quantityToDecrement));
                    if (card.getInventory() == 0) {
                        card.setInStock(false);
                    }
                    cardRepository.save(card);
                }
            }
        }
    }

    @Override
    public void sendOrderConfirmationEmail(String orderId, String customerEmail) {
        // Implementation for sending order confirmation email
    }

    @Override
    public void sendPaymentFailureEmail(String orderId, String customerEmail, String reason) {
        // Implementation for sending payment failure email
    }

    @Override
    public void handleRefund(String paymentIntentId, Long refundedAmount) {
        // Implementation for handling refund
    }

    @Override
    public Order findOrdersByPaymentSessionId(String paymentSessionId) {
        return orderRepository.findOrderByPaymentSessionId(paymentSessionId);
    }
}

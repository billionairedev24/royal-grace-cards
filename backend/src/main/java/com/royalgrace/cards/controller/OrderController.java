package com.royalgrace.cards.controller;

import com.royalgrace.cards.dto.UpdateOrderStatusRequest;
import com.royalgrace.cards.model.Order;
import com.royalgrace.cards.service.IOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final IOrderService orderService;

    @Autowired
    public OrderController(IOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) throws Exception {
        return orderService.createOrder(order);
    }

    // =========================
    // UPDATE PAYMENT STATUS
    // =========================
    @PatchMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable String id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(id, request);
    }

    @GetMapping("/session/{paymentSessionId}")
    public Order getOrdersByPaymentSessionId  (@PathVariable String paymentSessionId) {
        return orderService.findOrdersByPaymentSessionId(paymentSessionId);
    }
}

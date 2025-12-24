package com.royalgrace.cards.controller;

import com.royalgrace.cards.dto.UpdateOrderStatusRequest;
import com.royalgrace.cards.model.Order;
import com.royalgrace.cards.service.ICartService;
import com.royalgrace.cards.service.INotificationService;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.royalgrace.cards.service.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final IOrderService orderService;
    private final ICartService cartService;
    private final INotificationService notificationService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handle(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sig
    ) throws Exception {

        Event event = Webhook.constructEvent(payload, sig, webhookSecret);

        if (!"checkout.session.completed".equals(event.getType())) {
            return ResponseEntity.ok("Ignored");
        }

        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow();

        if (!"paid".equals(session.getPaymentStatus())) {
            return ResponseEntity.ok("Not paid");
        }

        String orderId = session.getMetadata().get("orderId");
        String cartSessionId = session.getMetadata().get("cartSessionId");

        orderService.updateOrderStatus(
                orderId,
                new UpdateOrderStatusRequest(Order.PaymentStatus.COMPLETED,
                        Order.FulfillmentStatus.PENDING)
        );

        orderService.decrementInventory(orderId);
        cartService.clearCart(cartSessionId);

        //Send Email
        orderService.getOrderById(orderId).ifPresent(order -> {
            notificationService.sendOrderConfirmationEmail(order);
        });
        return ResponseEntity.ok("Processed");
    }
}



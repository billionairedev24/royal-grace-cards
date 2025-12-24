package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.dto.CheckoutItemDto;
import com.royalgrace.cards.dto.CheckoutRequest;
import com.royalgrace.cards.dto.CheckoutResponse;
import com.royalgrace.cards.dto.QRCodeRequest;
import com.royalgrace.cards.dto.QRCodeResponse;
import com.royalgrace.cards.model.AppConfig;
import com.royalgrace.cards.model.Card;
import com.royalgrace.cards.model.Order;
import com.royalgrace.cards.model.OrderItem;
import com.royalgrace.cards.model.ShippingAddress;
import com.royalgrace.cards.repository.CardRepository;
import com.royalgrace.cards.repository.OrderRepository;
import com.royalgrace.cards.service.ICartService;
import com.royalgrace.cards.service.IConfigService;
import com.royalgrace.cards.service.IPaymentService;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;



@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private final OrderRepository orderRepository;
    private final CardRepository cardRepository;
    private final IConfigService configService;
    private final ICartService cartService;

    @Value("${stripe.api-key:}")
    private String stripeSecretKey;

    private final Map<String, String> qrCodeDatabase = new ConcurrentHashMap<>();

    // ============================
    // CHECKOUT ENTRY POINT
    // ============================
    @Override
    public CheckoutResponse checkout(
            CheckoutRequest request,
            HttpServletRequest httpRequest
    ) throws Exception {

        if (request == null || request.getPaymentMethod() == null) {
            throw new IllegalArgumentException("Payment method is required");
        }

        String cartSessionId = cartService.resolveSessionId(httpRequest);
        if (cartSessionId == null) {
            throw new IllegalStateException("Cart session not found");
        }

        Order order = buildOrderFromRequest(request);
        order.setCartSessionId(cartSessionId);

        orderRepository.save(order);

        return switch (order.getPaymentMethod()) {
            case STRIPE -> initiateStripeCheckout(order, httpRequest);
            case ZELLE, CASHAPP -> pendingOfflinePaymentResponse(order);
        };
    }

    // ============================
    // ORDER BUILDING
    // ============================
    private Order buildOrderFromRequest(CheckoutRequest request) throws Exception {

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());

        order.setShippingAddress(new ShippingAddress(
                request.getShippingAddress().getStreet(),
                request.getShippingAddress().getCity(),
                request.getShippingAddress().getState(),
                request.getShippingAddress().getZipCode()
        ));

        order.setPaymentMethod(Order.PaymentMethod.valueOf(request.getPaymentMethod().name()));
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setFulfillmentStatus(Order.FulfillmentStatus.PENDING);

        double subtotal = 0.0;

        for (CheckoutItemDto itemDto : request.getItems()) {

            Card card = cardRepository.findById(itemDto.getCardId())
                    .orElseThrow(() -> new IllegalArgumentException("Card not found"));

            if (!Boolean.TRUE.equals(card.isInStock())) {
                throw new IllegalStateException("Card out of stock: " + card.getName());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setCard(card);
            item.setQuantity(itemDto.getQuantity());
            item.setPriceAtPurchase(card.getPrice());

            subtotal += card.getPrice() * itemDto.getQuantity();
            order.getItems().add(item);
        }

        order.setSubtotal(subtotal);

        AppConfig config = configService.getConfig();
        double shippingFee = subtotal >= config.getFreeShippingThreshold()
                ? 0.0
                : config.getStandardShippingFee();

        order.setShippingFee(shippingFee);
        order.setTotal(subtotal + shippingFee);

        return order;
    }

    // ============================
    // STRIPE CHECKOUT
    // ============================
    private CheckoutResponse initiateStripeCheckout(
            Order order,
            HttpServletRequest request
    ) throws Exception {

        Stripe.apiKey = stripeSecretKey;

        String baseUrl = getBaseUrl(request);
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(item.getQuantity().longValue())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount((long) (item.getPriceAtPurchase() * 100))
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.getCard().getName())
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        if (order.getShippingFee() > 0) {
            lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount((long) (order.getShippingFee() * 100))
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Shipping Fee")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        Session session = Session.create(
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .addAllLineItem(lineItems)
                        .setSuccessUrl(baseUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(baseUrl + "/payment/cancel")
                        .putMetadata("orderId", order.getId())
                        .putMetadata("cartSessionId", order.getCartSessionId())
                        .build()
        );

        order.setPaymentSessionId(session.getId());
        orderRepository.save(order);
        return CheckoutResponse.builder()
                .success(true)
                .sessionId(session.getId())
                .checkoutUrl(session.getUrl())
                .build();
    }

    private String getBaseUrl(HttpServletRequest request) {
        String uiUrl = request.getHeader("X-UI-BASE-URL");
        if (uiUrl != null && !uiUrl.isBlank()) {
            return uiUrl;
        }
        // fallback to server URL
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        boolean defaultPort = ("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443);
        return scheme + "://" + host + (defaultPort ? "" : ":" + port);
    }

    // ============================
    // OFFLINE PAYMENTS
    // ============================
    private CheckoutResponse pendingOfflinePaymentResponse(Order order) {
        return CheckoutResponse.builder()
                .success(true)
                .message("Order created. Complete payment via " + order.getPaymentMethod())
                .build();
    }

    // ============================
    // QR PAYMENTS
    // ============================
    @Override
    public QRCodeResponse generateQRCodes(QRCodeRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        Map<String, String> qrCodes = Map.of(
                "ZELLE", "placeholder_zelle_qr",
                "CASHAPP", "placeholder_cashapp_qr"
        );

        return new QRCodeResponse(qrCodes, order.getTotal(), order.getId());
    }

    @Override
    public boolean verifyQRCodePayment(String qrCodeId, String transactionId) {
        return qrCodeDatabase.containsKey(qrCodeId);
    }
}

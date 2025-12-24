package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.dto.CartItemResponse;
import com.royalgrace.cards.dto.CartResponse;
import com.royalgrace.cards.model.Card;
import com.royalgrace.cards.model.Cart;
import com.royalgrace.cards.model.CartItem;
import com.royalgrace.cards.repository.CardRepository;
import com.royalgrace.cards.repository.CartRepository;
import com.royalgrace.cards.service.ICartService;
import com.royalgrace.cards.util.CartCookieUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements ICartService {

    private final CartRepository cartRepository;
    private final CardRepository cardRepository;

    // =========================
    // PUBLIC API
    // =========================

    @Override
    public CartResponse getCart(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return map(resolveCart(request, response));
    }

    @Override
    public CartResponse addItem(
            HttpServletRequest request,
            HttpServletResponse response,
            String cardId
    ) {
        Cart cart = resolveCart(request, response);
        Card card = getCard(cardId);

        cart.getItems().stream()
                .filter(i -> i.getCard().getId().equals(cardId))
                .findFirst()
                .ifPresentOrElse(
                        i -> i.setQuantity(i.getQuantity() + 1),
                        () -> cart.getItems().add(
                                CartItem.builder()
                                        .cart(cart)
                                        .card(card)
                                        .quantity(1)
                                        .build()
                        )
                );

        return map(cart);
    }

    @Override
    public CartResponse updateQuantity(
            HttpServletRequest request,
            HttpServletResponse response,
            String cardId,
            int quantity
    ) {
        Cart cart = resolveCart(request, response);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getCard().getId().equals(cardId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        return map(cart);
    }

    @Override
    public void clearCart(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) return;

        cartRepository.findBySessionId(sessionId)
                .ifPresent(cart -> cartRepository.deleteById(cart.getId()));
    }

    @Override
    public String resolveSessionId(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        return Arrays.stream(request.getCookies())
                .filter(c -> CartCookieUtil.CART_ID.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    // =========================
    // CART RESOLUTION
    // =========================

    private Cart resolveCart(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return Optional.ofNullable(resolveSessionId(request))
                .flatMap(cartRepository::findBySessionId)
                .orElseGet(() -> createCart(response));
    }

    private Cart createCart(HttpServletResponse response) {

        String sessionId = UUID.randomUUID().toString();

        Cart cart = new Cart();
        cart.setSessionId(sessionId);

        Cart saved = cartRepository.saveAndFlush(cart);

        CartCookieUtil.set(response, sessionId, isProduction());

        return saved;
    }

    // =========================
    // HELPERS
    // =========================

    private Card getCard(String cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
    }

    private boolean isProduction() {
        return !"local".equalsIgnoreCase(System.getenv("SPRING_PROFILES_ACTIVE"));
    }

    private CartResponse map(Cart cart) {

        if (cart.getItems().isEmpty()) {
            return new CartResponse(List.of(), 0, 0);
        }

        var items = cart.getItems().stream()
                .map(i -> new CartItemResponse(
                        i.getCard().getId(),
                        i.getCard().getName(),
                        i.getCard().getPrice(),
                        i.getQuantity()
                ))
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        double subtotal = items.stream()
                .mapToDouble(i -> i.price() * i.quantity())
                .sum();

        return new CartResponse(items, totalItems, subtotal);
    }
}

package com.royalgrace.cards.controller;

import com.royalgrace.cards.dto.AddItemRequest;
import com.royalgrace.cards.dto.CartResponse;
import com.royalgrace.cards.dto.UpdateQuantityRequest;
import com.royalgrace.cards.service.ICartService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final ICartService cartService;

    // =====================
    // GET CART
    // =====================
    @GetMapping
    public CartResponse getCart(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return cartService.getCart(request, response);
    }

    // =====================
    // ADD ITEM
    // =====================
    @PostMapping("/items")
    public CartResponse addItem(
            @RequestBody AddItemRequest requestBody,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return cartService.addItem(
                request,
                response,
                requestBody.cardId()
        );
    }

    // =====================
    // UPDATE QUANTITY
    // =====================
    @PutMapping("/items/{cardId}")
    public CartResponse updateQuantity(
            @PathVariable String cardId,
            @RequestBody UpdateQuantityRequest requestBody,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return cartService.updateQuantity(
                request,
                response,
                cardId,
                requestBody.quantity()
        );
    }

    // =====================
    // REMOVE ITEM
    // =====================
    @DeleteMapping("/items/{cardId}")
    public CartResponse removeItem(
            @PathVariable String cardId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return cartService.removeItem(
                request,
                response,
                cardId
        );
    }

    // =====================
// CLEAR CART
// =====================
    @DeleteMapping
    public void clearCart(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // Safely handle null cookies
        String sessionId = Arrays.stream(Optional.ofNullable(request.getCookies())
                        .orElse(new Cookie[0]))
                .filter(c -> "CART_ID".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (sessionId != null) {
            cartService.clearCart(sessionId);
        }
    }

}

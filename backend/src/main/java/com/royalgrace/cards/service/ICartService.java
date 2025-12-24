package com.royalgrace.cards.service;


import com.royalgrace.cards.dto.CartResponse;

import com.royalgrace.cards.dto.CartResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface ICartService {

    CartResponse getCart(
            HttpServletRequest request,
            HttpServletResponse response
    );

    CartResponse addItem(
            HttpServletRequest request,
            HttpServletResponse response,
            String cardId
    );

    CartResponse updateQuantity(
            HttpServletRequest request,
            HttpServletResponse response,
            String cardId,
            int quantity
    );

    default CartResponse removeItem(
            HttpServletRequest request,
            HttpServletResponse response,
            String cardId
    ) {
        return updateQuantity(request, response, cardId, 0);
    }

    void clearCart(String sessionId);

    String resolveSessionId(HttpServletRequest request);
}

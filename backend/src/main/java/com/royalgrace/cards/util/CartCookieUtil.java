package com.royalgrace.cards.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

public final class CartCookieUtil {

    public static final String CART_ID = "CART_ID";

    public static void set(HttpServletResponse response, String sessionId, boolean secure) {
        ResponseCookie cookie = ResponseCookie.from(CART_ID, sessionId)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(60 * 60 * 24 * 7)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    public static void clear(HttpServletResponse response, boolean secure) {
        ResponseCookie cookie = ResponseCookie.from(CART_ID, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private CartCookieUtil() {}
}


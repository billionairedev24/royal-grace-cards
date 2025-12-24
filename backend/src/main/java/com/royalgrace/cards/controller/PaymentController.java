package com.royalgrace.cards.controller;

import com.royalgrace.cards.dto.CheckoutRequest;
import com.royalgrace.cards.dto.CheckoutResponse;
import com.royalgrace.cards.dto.QRCodeRequest;
import com.royalgrace.cards.dto.QRCodeResponse;
import com.royalgrace.cards.service.IPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final IPaymentService paymentService;

    @Autowired
    public PaymentController(IPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@RequestBody CheckoutRequest request, HttpServletRequest httpServletRequest) throws Exception {
        return paymentService.checkout(request, httpServletRequest);
    }

    @PostMapping("/qr-codes")
    public QRCodeResponse generateQRCodes(@RequestBody QRCodeRequest request) {
        return paymentService.generateQRCodes(request);
    }
}

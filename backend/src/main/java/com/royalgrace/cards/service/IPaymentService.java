package com.royalgrace.cards.service;

import com.royalgrace.cards.dto.CheckoutRequest;
import com.royalgrace.cards.dto.CheckoutResponse;
import com.royalgrace.cards.dto.QRCodeRequest;
import com.royalgrace.cards.dto.QRCodeResponse;
import com.royalgrace.cards.model.Order;
import jakarta.servlet.http.HttpServletRequest;

public interface IPaymentService {
    
    CheckoutResponse checkout(CheckoutRequest request, HttpServletRequest httpServletRequest) throws Exception;

    QRCodeResponse generateQRCodes(QRCodeRequest request);

    boolean verifyQRCodePayment(String qrCodeId, String transactionId);
}

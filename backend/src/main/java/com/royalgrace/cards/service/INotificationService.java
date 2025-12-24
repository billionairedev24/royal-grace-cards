package com.royalgrace.cards.service;

import com.royalgrace.cards.model.Order;

public interface INotificationService {

    void sendOrderConfirmationEmail(Order order);
}

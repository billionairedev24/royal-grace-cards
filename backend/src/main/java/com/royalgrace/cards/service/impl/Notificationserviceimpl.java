package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.model.Order;
import com.royalgrace.cards.service.INotificationService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class Notificationserviceimpl implements INotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Override
    public void sendOrderConfirmationEmail(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Your Order Confirmation - " + order.getId());
            helper.setFrom("no-reply@yourdomain.com");

            // Prepare Thymeleaf context
            Context context = new Context();
            context.setVariable("order", order);

            // Render HTML template
            String html = templateEngine.process("order-confirmation.html", context);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Order confirmation email sent successfully to {}", order.getCustomerEmail());

        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email to {}: {}",
                    order.getCustomerEmail(), e.getMessage(), e);
            // Optionally, handle retry or store failed email for later
        }
    }
}

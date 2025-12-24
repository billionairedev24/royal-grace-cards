package com.royalgrace.cards.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

import static com.royalgrace.cards.constants.Constants.ENCODING;
import static com.royalgrace.cards.constants.Constants.MAIL_DEBUG;
import static com.royalgrace.cards.constants.Constants.MAIL_SMTP_AUTH;
import static com.royalgrace.cards.constants.Constants.MAIL_SMTP_STARTTLS_ENABLE;
import static com.royalgrace.cards.constants.Constants.MAIL_TRANSPORT_PROTOCOL;
import static com.royalgrace.cards.constants.Constants.SMTP;
import static java.lang.Boolean.TRUE;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host}")
    private String emailHost;

    @Value("${spring.mail.port}")
    private int emailServerPort;

    @Value("${spring.mail.username}")
    private String emailServerUsername;

    @Value("${spring.mail.password}")
    private String smailServerPassword;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(emailHost);
        sender.setPort(emailServerPort);
        sender.setUsername(emailServerUsername);
        sender.setPassword(smailServerPassword);
        sender.setDefaultEncoding(ENCODING);
        Properties props = sender.getJavaMailProperties();
        props.put(MAIL_TRANSPORT_PROTOCOL, SMTP);
        props.put(MAIL_SMTP_AUTH, TRUE);
        props.put(MAIL_SMTP_STARTTLS_ENABLE, TRUE);
        props.put(MAIL_DEBUG, TRUE);
        return sender;
    }
}

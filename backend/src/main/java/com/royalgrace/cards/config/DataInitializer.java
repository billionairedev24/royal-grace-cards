package com.royalgrace.cards.config;

import com.royalgrace.cards.repository.UserRepository;
import com.royalgrace.cards.service.UserService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    public void run(String @NonNull ... args) {
        // Create default admin user if no users exist
        if (userRepository.count() == 0) {
            userService.createAdmin("admin", "admin123", "admin@example.com");
            // Create a regular user for testing
            userService.createRegularUser("user", "user123", "user@example.com");
        }
    }
}
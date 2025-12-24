package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.model.User;
import com.royalgrace.cards.repository.UserRepository;
import com.royalgrace.cards.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(String username, String password, String email, Set<String> roles) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(username, passwordEncoder.encode(password), email);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    public User createAdmin(String username, String password, String email) {
        Set<String> roles = new HashSet<>();
        roles.add("ADMIN");
        roles.add("USER");
        return createUser(username, password, email, roles);
    }

    public User createRegularUser(String username, String password, String email) {
        Set<String> roles = new HashSet<>();
        roles.add("USER");
        return createUser(username, password, email, roles);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<User> getAllAdmins() {
        return userRepository.findByRole("ADMIN");
    }

}

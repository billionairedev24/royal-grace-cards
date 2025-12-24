package com.royalgrace.cards.service;

import com.royalgrace.cards.model.User;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserService {
    User createUser(String username, String password, String email, Set<String> roles);
    User createAdmin(String username, String password, String email);
    User createRegularUser(String username, String password, String email);
    Optional<User> findByUsername(String username);
    List<User> getAllAdmins();
}

package com.royalgrace.cards.service;

import com.royalgrace.cards.model.Admin;
import java.util.Optional;

public interface IAdminService {
    
    Optional<Admin> authenticate(String username, String password);
    
    Admin createAdmin(Admin admin);
    
    boolean validateToken(String token);
    
    String generateToken(Admin admin);
}

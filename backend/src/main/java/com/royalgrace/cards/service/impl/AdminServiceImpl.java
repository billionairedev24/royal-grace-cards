package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.model.Admin;
import com.royalgrace.cards.repository.AdminRepository;
import com.royalgrace.cards.service.IAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AdminServiceImpl implements IAdminService {
    
    private final AdminRepository adminRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final Map<String, String> tokenStore = new HashMap<>();
    
    @Autowired
    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Admin> authenticate(String username, String password) {
        Optional<Admin> admin = adminRepository.findByUsername(username);
        
        if (admin.isPresent() && passwordEncoder.matches(password, admin.get().getPassword())) {
            return admin;
        }
        
        return Optional.empty();
    }
    
    @Override
    public Admin createAdmin(Admin admin) {
        // Hash the password before saving
        String hashedPassword = passwordEncoder.encode(admin.getPassword());
        admin.setPassword(hashedPassword);
        return adminRepository.save(admin);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        return tokenStore.containsKey(token);
    }
    
    @Override
    public String generateToken(Admin admin) {
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, admin.getId());
        return token;
    }
}

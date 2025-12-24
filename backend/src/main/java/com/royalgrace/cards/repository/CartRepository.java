package com.royalgrace.cards.repository;


import com.royalgrace.cards.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, String> {

    Optional<Cart> findBySessionId(String sessionId);

    void deleteBySessionId(String sessionId);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.updatedAt < :cutoff")
    void deleteAllExpired(@Param("cutoff") LocalDateTime cutoff);

}


package com.royalgrace.cards.repository;

import com.royalgrace.cards.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, String> {
    
    List<Card> findByCategory(String category);
    
    List<Card> findByInStockTrue();
    
    List<Card> findByCategoryAndInStockTrue(String category);
    
    List<Card> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String name, String description
    );
}

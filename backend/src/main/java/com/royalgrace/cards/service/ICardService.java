package com.royalgrace.cards.service;

import com.royalgrace.cards.model.Card;
import java.util.List;
import java.util.Optional;

public interface ICardService {
    
    List<Card> getAllCards();
    
    Optional<Card> getCardById(String id);
    
    List<Card> getCardsByCategory(String category);
    
    List<Card> getInStockCards();
    
    List<Card> searchCards(String query);
    
    Card createCard(Card card);
    
    Card updateCard(String id, Card card);
    
    void deleteCard(String id);
    
    boolean existsById(String id);
}

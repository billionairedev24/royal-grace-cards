package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.model.Card;
import com.royalgrace.cards.repository.CardRepository;
import com.royalgrace.cards.service.ICardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CardServiceImpl implements ICardService {
    
    private final CardRepository cardRepository;
    
    @Autowired
    public CardServiceImpl(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Card> getCardById(String id) {
        return cardRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Card> getCardsByCategory(String category) {
        return cardRepository.findByCategory(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Card> getInStockCards() {
        return cardRepository.findByInStockTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Card> searchCards(String query) {
        return cardRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }
    
    @Override
    public Card createCard(Card card) {
        return cardRepository.save(card);
    }
    
    @Override
    public Card updateCard(String id, Card card) {
        if (!cardRepository.existsById(id)) {
            throw new IllegalArgumentException("Card not found with id: " + id);
        }
        card.setId(id);
        return cardRepository.save(card);
    }
    
    @Override
    public void deleteCard(String id) {
        if (!cardRepository.existsById(id)) {
            throw new IllegalArgumentException("Card not found with id: " + id);
        }
        cardRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsById(String id) {
        return cardRepository.existsById(id);
    }
}

package com.royalgrace.cards.job;

import com.royalgrace.cards.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CartCleanupJob {

    private final CartRepository cartRepository;

    @Scheduled(cron = "0 0 * * * *") // every hour
    public void deleteExpiredCarts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        cartRepository.deleteAllExpired(cutoff);
    }
}


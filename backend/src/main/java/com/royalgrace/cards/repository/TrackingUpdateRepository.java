package com.royalgrace.cards.repository;

import com.royalgrace.cards.model.TrackingUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackingUpdateRepository extends JpaRepository<TrackingUpdate, String> {
}

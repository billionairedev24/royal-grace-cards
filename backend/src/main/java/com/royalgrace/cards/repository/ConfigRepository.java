package com.royalgrace.cards.repository;

import com.royalgrace.cards.model.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigRepository extends JpaRepository<AppConfig, String> {
}

package com.royalgrace.cards.service.impl;

import com.royalgrace.cards.model.AppConfig;
import com.royalgrace.cards.repository.ConfigRepository;
import com.royalgrace.cards.service.IConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ConfigServiceImpl implements IConfigService {
    
    private final ConfigRepository configRepository;
    
    @Autowired
    public ConfigServiceImpl(ConfigRepository settingsRepository) {
        this.configRepository = settingsRepository;
    }
    


    @Override
    public AppConfig updateConfig(AppConfig config) {
        configRepository.findById(config.getId())
                .ifPresent(configRepository::save);
        return config;
    }

    @Override
    public AppConfig getConfig() throws Exception {

        List<AppConfig> configuration = configRepository.findAll();

        if(configuration.size() > 1) {
            throw new Exception("More than one config found");
        }

        if (configuration.isEmpty()) {
            var initialConfig = new AppConfig();
            initialConfig.setCashappEnabled(true);
            initialConfig.setStripeEnabled(true);
            initialConfig.setZelleEnabled(true);
            initialConfig.setStandardShippingFee(4.8);
            initialConfig.setFreeShippingThreshold(5);
            initialConfig.setZelleEmail("info@royalgracecards.com");
            initialConfig.setCashappHandle("@royalgracecards");
            initialConfig.setZellePhone("1234567890");
            return this.configRepository.save(initialConfig);
        }
        return configuration.get(0);
    }
}

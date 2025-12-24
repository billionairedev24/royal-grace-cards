package com.royalgrace.cards.service;

import com.royalgrace.cards.model.AppConfig;

public interface IConfigService {
    

    AppConfig updateConfig(AppConfig config);
    AppConfig getConfig() throws Exception;
}

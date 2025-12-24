package com.royalgrace.cards.controller;

import com.royalgrace.cards.model.AppConfig;
import com.royalgrace.cards.service.IConfigService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final IConfigService configService;

    public ConfigController(IConfigService configService) {
        this.configService = configService;
    }

    @GetMapping({"/admin/config", "/customer/config"})
    public AppConfig getConfig() throws Exception {
        return configService.getConfig();
    }


    @PutMapping("/admin/config")
    public AppConfig updateConfig(@RequestBody AppConfig config) {
        return configService.updateConfig(config);
    }
}

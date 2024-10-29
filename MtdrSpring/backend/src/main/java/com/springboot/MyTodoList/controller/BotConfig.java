package com.springboot.MyTodoList.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BotConfig {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.name}")
    private String botName;

    @Bean
    public String botToken() {
        return botToken;
    }

    @Bean
    public String botName() {
        return botName;
    }
}
package com.rentify.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Дозволяємо брокеру розсилати повідомлення в канали, що починаються з /topic
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Встановлюємо точку підключення для фронтенду і ДОЗВОЛЯЄМО доступ (CORS)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Дуже важливо, щоб браузер не блокував з'єднання!
                .withSockJS();
    }
}
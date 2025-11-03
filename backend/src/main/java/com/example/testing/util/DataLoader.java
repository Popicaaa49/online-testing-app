package com.example.testing.util;

import com.example.testing.model.Role;
import com.example.testing.model.User;
import com.example.testing.repo.RoleRepository;
import com.example.testing.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner init(RoleRepository roleRepo, UserRepository userRepo, PasswordEncoder encoder) {
        return args -> {
            var roleAdmin = roleRepo.findByName("ROLE_ADMIN").orElseGet(() -> roleRepo.save(new Role(null, "ROLE_ADMIN")));
            var roleUser  = roleRepo.findByName("ROLE_USER").orElseGet(() -> roleRepo.save(new Role(null, "ROLE_USER")));

            if (userRepo.findByUsername("admin").isEmpty()) {
                userRepo.save(User.builder()
                        .username("admin")
                        .password(encoder.encode("admin123"))
                        .roles(Set.of(roleAdmin, roleUser))
                        .enabled(true)
                        .build());
            }
            if (userRepo.findByUsername("user").isEmpty()) {
                userRepo.save(User.builder()
                        .username("user")
                        .password(encoder.encode("user123"))
                        .roles(Set.of(roleUser))
                        .enabled(true)
                        .build());
            }
        };
    }
}

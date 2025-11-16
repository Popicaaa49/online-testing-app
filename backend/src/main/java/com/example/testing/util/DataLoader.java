package com.example.testing.util;

import com.example.testing.model.*;
import com.example.testing.repo.RoleRepository;
import com.example.testing.repo.TestPaperRepository;
import com.example.testing.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;

@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner init(RoleRepository roleRepo,
                           UserRepository userRepo,
                           TestPaperRepository testPaperRepository,
                           PasswordEncoder encoder) {
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

            if (testPaperRepository.count() == 0) {
                seedTests(testPaperRepository);
            }
        };
    }

    private void seedTests(TestPaperRepository testPaperRepository) {
        TestPaper javaTest = TestPaper.builder()
                .title("Java Fundamentals")
                .category("Programare")
                .description("Verifica notiunile de baza Java si colectii")
                .durationMinutes(30)
                .build();

        TestQuestion question1 = TestQuestion.builder()
                .text("Ce colectie pastreaza ordinea de inserare si permite valori duplicate?")
                .points(2)
                .orderIndex(1)
                .build();
        question1.addOption(AnswerOption.builder().text("HashSet").correct(false).build());
        question1.addOption(AnswerOption.builder().text("ArrayList").correct(true).build());
        question1.addOption(AnswerOption.builder().text("TreeSet").correct(false).build());

        TestQuestion question2 = TestQuestion.builder()
                .text("Ce cuvant cheie este folosit pentru a mosteni o clasa?")
                .points(1)
                .orderIndex(2)
                .build();
        question2.addOption(AnswerOption.builder().text("implements").correct(false).build());
        question2.addOption(AnswerOption.builder().text("extends").correct(true).build());
        question2.addOption(AnswerOption.builder().text("instanceof").correct(false).build());

        javaTest.setQuestions(List.of(question1, question2));

        TestPaper webTest = TestPaper.builder()
                .title("Web Essentials")
                .category("Web")
                .description("HTTP, REST si frontend basics")
                .durationMinutes(20)
                .build();

        TestQuestion webQuestion1 = TestQuestion.builder()
                .text("Ce cod de status HTTP se foloseste pentru resursa creata?")
                .points(2)
                .orderIndex(1)
                .build();
        webQuestion1.addOption(AnswerOption.builder().text("200 OK").correct(false).build());
        webQuestion1.addOption(AnswerOption.builder().text("201 Created").correct(true).build());
        webQuestion1.addOption(AnswerOption.builder().text("400 Bad Request").correct(false).build());

        TestQuestion webQuestion2 = TestQuestion.builder()
                .text("Ce hook React se foloseste pentru stare locala?")
                .points(1)
                .orderIndex(2)
                .build();
        webQuestion2.addOption(AnswerOption.builder().text("useEffect").correct(false).build());
        webQuestion2.addOption(AnswerOption.builder().text("useState").correct(true).build());
        webQuestion2.addOption(AnswerOption.builder().text("useMemo").correct(false).build());

        webTest.setQuestions(List.of(webQuestion1, webQuestion2));

        testPaperRepository.saveAll(List.of(javaTest, webTest));
    }
}

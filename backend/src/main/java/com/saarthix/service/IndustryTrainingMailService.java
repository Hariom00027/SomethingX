package com.saarthix.service;

import com.saarthix.model.IndustryTrainingNotification;
import com.saarthix.model.IndustryTrainingRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class IndustryTrainingMailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(IndustryTrainingMailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;

    @Value("${app.notifications.mail.from:noreply@saarthix.com}")
    private String fromAddress;

    @Autowired
    public IndustryTrainingMailService(@Nullable JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.enabled = mailSender != null;
    }

    public void sendTrainingApprovalEmail(IndustryTrainingRequest request,
                                          IndustryTrainingNotification notification) {
        if (!enabled) {
            LOGGER.debug("Mail sender bean not configured. Skipping email notification for request {}", request.getId());
            return;
        }
        if (request.getContactEmail() == null || request.getContactEmail().isBlank()) {
            LOGGER.warn("Request {} has no contact email. Skipping email notification.", request.getId());
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(request.getContactEmail());
            message.setSubject(notification.getSubject() != null
                    ? notification.getSubject()
                    : "Training request confirmed");

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(request.getContactName() != null ? request.getContactName() : "Team").append(",\n\n")
                    .append("Your training request for ")
                    .append(notification.getTrainingName() != null ? notification.getTrainingName() : "the selected cohort")
                    .append(" has been confirmed.\n")
                    .append("Status: ").append(notification.getTrainingStatus() != null ? notification.getTrainingStatus() : "Confirmed")
                    .append("\n");

            if (notification.getPricingDetails() != null && !notification.getPricingDetails().isBlank()) {
                body.append("\nPricing: ").append(notification.getPricingDetails());
            }

            if (notification.getSchedule() != null && !notification.getSchedule().isBlank()) {
                body.append("\nSchedule: ").append(notification.getSchedule());
            }

            if (notification.getAdminContactName() != null && !notification.getAdminContactName().isBlank()) {
                body.append("\nPrimary Contact: ").append(notification.getAdminContactName());
                if (notification.getAdminContactEmail() != null && !notification.getAdminContactEmail().isBlank()) {
                    body.append(" • ").append(notification.getAdminContactEmail());
                }
                if (notification.getAdminContactPhone() != null && !notification.getAdminContactPhone().isBlank()) {
                    body.append(" • ").append(notification.getAdminContactPhone());
                }
            }

            if (notification.getResourceLink() != null && !notification.getResourceLink().isBlank()) {
                body.append("\nResources: ").append(notification.getResourceLink());
            }

            body.append("\n\nThank you,\nSaarthiX Team");
            message.setText(body.toString());

            mailSender.send(message);
            LOGGER.info("Sent training approval email to {}", request.getContactEmail());
        } catch (Exception ex) {
            LOGGER.error("Failed to send training approval email for request {}", request.getId(), ex);
        }
    }
}



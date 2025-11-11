package com.saarthix.service;

import com.saarthix.model.IndustryTrainingNotification;
import com.saarthix.model.IndustryTrainingRequest;
import com.saarthix.repository.IndustryTrainingNotificationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class IndustryTrainingNotificationService {

    private final IndustryTrainingNotificationRepository notificationRepository;

    public IndustryTrainingNotificationService(IndustryTrainingNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public IndustryTrainingNotification createApprovalNotification(IndustryTrainingRequest request) {
        IndustryTrainingNotification notification = new IndustryTrainingNotification();
        notification.setRequestId(request.getId());
        notification.setCompanyName(request.getCompanyName());
        notification.setContactEmail(request.getContactEmail());
        notification.setContactName(request.getContactName());
        String trainingName = request.getSpecificRole() != null && !request.getSpecificRole().isBlank()
                ? request.getSpecificRole()
                : request.getTrainingRoleName();

        notification.setTrainingName(trainingName);
        notification.setSchedule(request.getAdminSchedule());
        notification.setTrainingStatus("CONFIRMED");
        notification.setSubject("Training confirmed: " + trainingName);

        StringBuilder message = new StringBuilder();
        message.append("Your training request for ").append(trainingName).append(" has been confirmed.\n\n")
                .append("Status: Confirmed");

        if (request.getAdminMessage() != null && !request.getAdminMessage().isBlank()) {
            message.append("\n\nNotes from SaarthiX:\n").append(request.getAdminMessage());
        }

        if (request.getAdminPricingDetails() != null && !request.getAdminPricingDetails().isBlank()) {
            message.append("\n\nPricing: ").append(request.getAdminPricingDetails());
        }

        if (request.getAdminSchedule() != null && !request.getAdminSchedule().isBlank()) {
            message.append("\nSchedule: ").append(request.getAdminSchedule());
        }

        if (request.getAdminContactName() != null && !request.getAdminContactName().isBlank()) {
            message.append("\n\nPrimary Contact: ").append(request.getAdminContactName());
            if (request.getAdminContactEmail() != null && !request.getAdminContactEmail().isBlank()) {
                message.append(" • ").append(request.getAdminContactEmail());
            }
            if (request.getAdminContactPhone() != null && !request.getAdminContactPhone().isBlank()) {
                message.append(" • ").append(request.getAdminContactPhone());
            }
        }

        notification.setMessage(message.toString());
        notification.setAdminContactName(request.getAdminContactName());
        notification.setAdminContactEmail(request.getAdminContactEmail());
        notification.setAdminContactPhone(request.getAdminContactPhone());
        notification.setPricingDetails(request.getAdminPricingDetails());
        notification.setResourceLink(request.getAdminResourceLink());

        return notificationRepository.save(notification);
    }

    public List<IndustryTrainingNotification> notificationsForContact(String contactEmail) {
        return notificationRepository.findByContactEmailOrderByCreatedAtDesc(contactEmail);
    }

    public Optional<IndustryTrainingNotification> markAsRead(String notificationId) {
        Optional<IndustryTrainingNotification> notificationOpt = notificationRepository.findById(notificationId);
        notificationOpt.ifPresent(notification -> {
            notification.setStatus("READ");
            notification.setReadAt(Instant.now());
            notificationRepository.save(notification);
        });
        return notificationOpt;
    }
}



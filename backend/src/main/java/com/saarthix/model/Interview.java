package com.saarthix.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "interviews")
public class Interview {

    @Id
    private String id;
    private String candidateId;
    private String question;
    private String answer;
}

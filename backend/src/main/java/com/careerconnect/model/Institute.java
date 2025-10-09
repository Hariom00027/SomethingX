package com.careerconnect.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "institutes")
public class Institute {

    @Id
    private String id;
    private String name;
    private List<String> internships;
    private List<String> trainings;
}

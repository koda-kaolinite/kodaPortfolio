---
title: "From Localhost to the Cloud: Integrating Keystone with Google Cloud Platform"
description: "A practical analysis of our cloud strategy. See how we use Cloud SQL and Google Cloud Storage to create a robust and scalable backend infrastructure, and how Spring Cloud GCP drastically simplified this integration."
date: 2025-07-27
image: https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 9
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/20250809_2318_Homem com Fones_remix_01k28w7xx5ehz85pss8pqtxek5-1.webp
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Developing a robust application locally is only half the battle. For a system like Keystone to serve its users reliably and scalably, it needs a solid cloud infrastructure. The choice of platform and the integration strategy are critical decisions that impact the performance, cost, and maintainability of the project.

In this post, we will detail our decision to standardize on **Google Cloud Platform (GCP)** and how we integrated our Spring Boot application with two of its main services: **Cloud SQL** for our database and **Google Cloud Storage (GCS)** for file storage.

## Phase 1: The Strategy - Why Google Cloud? (ADR-0019)

The decision to consolidate our infrastructure on GCP was strategic. Instead of mixing providers, we opted for a unified ecosystem to simplify management, security (IAM), and integration between services.

Our two most critical infrastructure needs were:
1.  **A managed relational database:** We needed the robustness of PostgreSQL, but without the burden of managing servers, backups, patches, and replication.
2.  **A place to store large files:** Property images are a central asset of Keystone and need to be stored securely, durably, and with low access latency.

The answer to these requirements in GCP was clear: **Cloud SQL for PostgreSQL** and **Google Cloud Storage (GCS)**.

## Phase 2: Data Persistence with Cloud SQL

Using a managed database service like Cloud SQL frees us to focus on what really matters: the business logic of our application.

The integration with our Spring Boot application was remarkably simple, thanks to **Spring Cloud GCP**. In our `build.gradle` file, we added the dependency:

```groovy
// build.gradle
implementation("com.google.cloud:spring-cloud-gcp-starter-sql-postgresql")
```

This starter does a lot of heavy lifting for us. In a production environment, it allows the application to connect to the Cloud SQL instance securely using the environment's Service Account credentials (via IAM), eliminating the need to store database passwords in configuration files.

Our production configuration (`application-prod.properties`) becomes more secure and declarative, focusing on the instance name instead of explicit credentials.

## Phase 3: Media Storage with Google Cloud Storage (GCS)

For the property images, GCS was the ideal choice. It is an object storage service designed for high durability and global performance.

Following the principles of our architecture, the responsibility of interacting with GCS was encapsulated in our `Files` module, behind an `IStorageService` interface. This ensures that the rest of the application does not need to know where or how the files are stored.

The concrete implementation, `GcsStorageService`, uses another starter from Spring Cloud GCP:

```groovy
// build.gradle
implementation 'com.google.cloud:spring-cloud-gcp-starter-storage'
```

This starter autoconfigures a `Storage` bean from the Google Cloud SDK, which we can inject directly into our service. The code to upload an image becomes incredibly clean:

```java
// GcsStorageService.java (simplified)
@Service
public class GcsStorageService implements IStorageService {

    // Injected automatically by Spring Cloud GCP
    private final Storage storage;

    @Override
    public String uploadImage(UUID propertyId, MultipartFile imageFile) throws IOException {
        String blobName = generateUniqueBlobName(propertyId, imageFile);
        BlobId blobId = BlobId.of("your-bucket-name", blobName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                                    .setContentType(imageFile.getContentType())
                                    .build();
        
        // The SDK handles all the API complexity
        storage.create(blobInfo, imageFile.getBytes());

        return "https://storage.googleapis.com/your-bucket-name/" + blobName;
    }
}
```

All the complexity of authentication, retries, and API calls is abstracted away by the starter and the SDK.

## Conclusion

The combination of a well-defined cloud strategy with the right integration tools, like Spring Cloud GCP, is an immense productivity accelerator. By delegating the complexity of the database and file storage infrastructure to managed services from GCP, our team at Keystone can focus on delivering business value, with the confidence that the foundation of our system is secure, scalable, and reliable.

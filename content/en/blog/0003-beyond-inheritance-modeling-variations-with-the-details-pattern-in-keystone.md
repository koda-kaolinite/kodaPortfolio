---
title: "Beyond Inheritance: Modeling Variations with the 'Details' Pattern in Keystone"
description: "How we avoided the pitfalls of inheritance in JPA when modeling different types of properties. A deep dive into our composition-based design pattern ('Details Pattern') and how it keeps our domain clean and our system scalable."
date: 2025-06-29
image: https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 11
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

One of the most common challenges in Domain-Driven Design (DDD) is modeling a business concept that has multiple variations. In our Keystone project, the `Property` aggregate is a perfect example. A property can be a `House`, an `Apartment`, a `Warehouse`, or a `Plot`. Each shares common attributes (like address and price), but also has unique data and rules: an apartment has a condominium fee, a warehouse has a dock height, and so on.

The traditional approach to solving this with object-oriented programming is **inheritance**. However, inheritance in conjunction with Object-Relational Mappers (ORMs) like JPA/Hibernate can lead to a path of pain and complexity. In this article, I will show how we rejected inheritance and adopted a pattern based on **Composition over Inheritance** that we call the "Details Pattern".

## Phase 1: The Problematic Alternatives (ADR-0023)

Before we arrived at our solution, we considered and discarded two common approaches:

### Alternative 1: The "God" Entity with Null Fields

The "simplest" solution would be to have a single `Property` table with all possible columns for all types of properties. A `property_type` field would distinguish between them, and the non-applicable fields would be null.

**Why we rejected it:**
-   **Polluted Schema:** The database becomes a minefield of null columns, making queries and maintenance confusing.
-   **Broken Invariants:** Where do you put the logic that a `Warehouse` MUST have a `dock_height`? The validation leaks out of the domain, usually into services full of `if/switch`, which is a classic symptom of an Anemic Domain Model.
-   **Violation of the Open/Closed Principle:** Adding a new type of property would require changing the central table and the `Property` class, a maintenance nightmare.

### Alternative 2: JPA Inheritance (`TABLE_PER_CLASS` or `JOINED`)

The "pure" object-oriented solution would be `class Apartment extends Property`. JPA offers strategies to map this hierarchy to the database.

**Why we rejected it:**
-   **Complexity with DDD Aggregates:** Where does the aggregate end? Is the root the base class `Property`? How do you ensure transactional consistency in a complex hierarchy?
-   **Inefficient Polymorphic Queries:** Querying all types of properties at once can generate complex and inefficient SQL, especially with the `JOINED` strategy.
-   **Rigidity:** Inheritance creates a very strong "is-a" relationship. What if a business concept could change type? Inheritance makes this almost impossible.

## Phase 2: The Solution - Composition with the "Details Pattern"

Our solution was to completely separate the shared data from the specific data of each type, using composition. The implementation has two main parts, aligned with our Clean Architecture.

### In the Domain (The Pure Model)

In the `domain` layer, our `Property` aggregate is a clean POJO (Plain Old Java Object).
-   It contains only the attributes common to **all** properties.
-   It has a `PropertyType` enum to identify its nature.
-   It has a generic field: `private Object details;`.

At runtime, this `details` field is populated with a specific and strongly typed `record` (immutable POJO), such as `HouseDetails`, `ApartmentDetails`, etc. The domain remains clean, cohesive, and completely ignorant of persistence.

```java
// Domain Layer
public class Property extends AbstractAggregateRoot<...> {
    private UUID id;
    private PropertyType type;
    private Object details; // Contains HouseDetails, ApartmentDetails, etc.
    // ...
}

public record HouseDetails(...) { /* ... house-specific fields ... */ }
```

### In the Infrastructure (The JPA Persistence)

The magic happens in the `infrastructure` layer.
-   The `PropertyJpaEntity` entity contains the common fields.
-   Instead of inheritance, it has a `@OneToOne` relationship for **each** possible detail type: `private HouseDetails houseDetails;`, `private ApartmentDetails apartmentDetails;`, and so on.
-   For any given property, only **one** of these relationships will be populated; the others will be null.
-   We use `cascade = CascadeType.ALL` and `orphanRemoval = true` so that the lifecycle of the details entity is fully controlled by the `PropertyJpaEntity`.

```java
// Infrastructure Layer
@Entity
public class PropertyJpaEntity {
    @Id private UUID id;
    @Enumerated(EnumType.STRING) private PropertyType type;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "house_details_id")
    private HouseDetails houseDetails; // JPA details entity

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "apartment_details_id")
    private ApartmentDetails apartmentDetails; // JPA details entity

    // ... and so on for all types
}
```

The `PropertyRepositoryImpl` acts as the translator, mapping between the clean domain aggregate (with its single `details` object) and the `PropertyJpaEntity` (with its multiple null `@OneToOne` relationships).

## Phase 3: Scaling the Pattern to the API (ADR-0026)

This pattern extended all the way to our API layer. Instead of having an endpoint for each property type (`POST /api/house`, `POST /api/apartment`), we have a single endpoint: `POST /api/property`.

The request (`CreatePropertyRequest`) is polymorphic. It contains the `propertyType` and a `details` field that the client fills with the JSON of the corresponding detail type. We use a `CreateDetailsMapperRegistry` that discovers at runtime which `Mapper` to use to convert the details DTO from the request into the domain details object.

This means that to add a new property type, like "Farm", we just need to:
1.  Create the `FarmDetails` record in the domain.
2.  Create the `FarmDetailsJpaEntity` entity in the infrastructure.
3.  Create the `CreateFarmRequest` DTO.
4.  Implement a `FarmDetailsMapper`.

No changes are needed in the main `Controllers` or `CommandHandlers`. This way the system is open for extension.

## Conclusion

The "Details Pattern" has been a resounding success in Keystone. It has given us:
-   **A Clean Domain:** Our business logic is isolated and not contaminated by persistence concerns.
-   **Maximum Flexibility:** Adding new types is trivial and low-risk.
-   **A Normalized Database Schema:** No unnecessary null columns.

The trade-off is a mapping complexity concentrated in the `Repository`, but this is a trade-off we gladly make for the clarity and scalability we gain in the rest of the system. It is a powerful demonstration of how "Composition over Inheritance" can lead to a more robust and sustainable software design.

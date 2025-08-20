---
title: "Architecture as Code: How We Guarantee Design Integrity in Keystone"
description: "Diagrams become outdated, but the code doesn't lie. See how we use a combination of DDD's Ubiquitous Language, architecture tests with ArchUnit, and ADRs to transform our design rules into living, executable artifacts, preventing architectural degradation."
date: 2025-07-13
image: https://images.pexels.com/photos/693857/pexels-photo-693857.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 10
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/20250809_2318_Homem com Fones_remix_01k28w7xx5ehz85pss8pqtxek5-1.webp
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

One of the hardest truths in software development is that architecture, no matter how well planned, tends to degrade over time. New features, tight deadlines, and the entry of new developers can gradually erode the boundaries and principles established at the beginning of the project. Diagrams on a wiki become outdated and good intentions are lost.

In the Keystone project, we combat this entropy by treating our **architecture as code**. We have adopted a three-pillar approach to ensure that our design is not just a plan, but a living reality, enforced with every commit.

## Pillar 1: The Ubiquitous Language - Our Social Contract (ADR-0018)

The first step to integrity is to ensure that everyone (developers, business analysts, stakeholders) speaks the same language. We adopted the concept of **Ubiquitous Language** from Domain-Driven Design (DDD) as our foundation.

This means that the terms used to describe the business are the same terms we use in the code.
-   A real estate agent is a `Property Broker` in the code.
-   A platform administrator is a `Platform Administrator`.
-   A property is a `Property`.

This unified language, formally defined in our **ADR-0018**, is our source of truth. It eliminates ambiguities and reduces cognitive load. When a business requirement talks about a `Property`, the developer knows exactly which aggregate, repository, and events to look for. The code becomes self-documenting and directly reflects the business domain.

## Pillar 2: Architecture Tests with ArchUnit - The Automated Inspector (ADR-0017)

The Ubiquitous Language is our social contract, but we need a mechanism to ensure that the rules are followed. The Java compiler cannot prevent a developer from, by mistake, making the Domain layer dependent on the Web layer, violating a fundamental principle of Clean Architecture.

This is where **ArchUnit** comes in. ArchUnit is a free Java library that allows us to write unit tests for our architecture. Instead of testing business logic, we test the structure of the code itself.

In our continuous integration pipeline, we have tests that check rules like:
-   **Layer Protection:** "No class in the `domain` layer can access classes from the `infrastructure` or `webAdapter` layer."
-   **Module Independence:** "Classes in the `Property` module cannot directly depend on internal classes of the `Administration` module."
-   **Naming Suffixes:** "Classes that implement `IPropertyRepository` must have the suffix `RepositoryImpl`."
-   **Use of Annotations:** "The `@Transactional` annotation can only be used in classes in the `application` or `infrastructure` layers, never in the `domain`."

If one of these rules is violated, the build fails. This transforms architectural governance from a manual and error-prone review into an automated, immediate, and non-negotiable process.

## Conclusion

Maintaining the integrity of an architecture does not happen by chance. It is a deliberate and continuous effort. In Keystone, the combination of a **Ubiquitous Language** (the contract), **tests with ArchUnit** (the enforcement), and **ADRs** (the historical record) gives us the confidence that our system can grow and evolve in a healthy way. We are not just building software; we are building a system designed to last, with its quality and design protected by code.

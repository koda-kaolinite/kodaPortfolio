---
title: "Building Keystone: Why Did We Choose a Modular Monolith?"
description: "An analysis of my strategic decision to start with a Modular Monolith architecture, combining the development speed of a monolith with the future scalability of microservices through Domain-Driven Design."
date: 2025-06-15
image: https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 10
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/20250809_2318_Homem com Fones_remix_01k28w7xx5ehz85pss8pqtxek5-1.webp
    alt: "Animated gif of Koda in pixelart"
---

When starting a new software project, one of the first and most impactful decisions is the choice of architecture. The "Monolith vs. Microservices" debate is omnipresent, with each approach presenting a distinct set of trade-offs. For the Keystone project, our real estate management platform, we opted for a pragmatic and strategic path: the **Modular Monolith**.

In this article, I will detail why this approach was the right choice for us, how **Domain-Driven Design (DDD)** became the backbone of our structure, and how we are prepared for the future without the initial complexity of microservices.

## First of all: ADRs - The Record of Our Decisions

The "why" behind an architectural decision is as important as the decision itself. To capture this context, we use **Architectural Decision Records (ADRs)**. Each ADR is a short markdown document that describes:
1.  **Context:** The problem or the force that led us to make a decision.
2.  **Decision:** The description of the choice we made.
3.  **Consequences:** The results, trade-offs, and implications of our decision.

Our ADRs are the historical record of our thinking. They help new team members understand why the system is the way it is and provide a rational basis for future evolutions.

You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

## Phase 1: The Architectural Dilemma

The promise of microservices is seductive: independent scalability, team autonomy, and resilience. However, this approach comes with a significant cost in operational complexity, infrastructure, and communication between services. Starting a project with this overhead can be fatal, a phenomenon known as the "microservices tax."

On the other hand, a traditional monolith, although simple to deploy and develop initially, runs the risk of becoming a "Big Ball of Mud" — a coupled, fragile, and difficult-to-maintain system.

Our goal was to find a balance: the simplicity of a single deploy and the development speed of a monolith, but with the clear internal boundaries and low coupling of a distributed system.

## Phase 2: The Decision for the Modular Monolith (ADR-0002)

We decided to adopt a **Modular Monolith** architecture. In essence, the system is built and deployed as a single process, but its source code is organized into independent and highly cohesive modules.

The main guideline for this division was not technical, but business-related. We used the principles of **Domain-Driven Design (DDD)** to decompose the system into **Bounded Contexts**, where each module represents a specific business subdomain.

For Keystone, this translated into the following modules (ADR-0004):

-   **`Property`**: The heart of the system, responsible for the complete lifecycle of a property.
-   **`Administration`**: Manages identity, access, permissions, and internal users.
-   **`Files`**: Handles storage, retrieval, and processing of media, such as photos and documents.
-   **`Notification`**: Centralizes the sending of notifications (e-mail, SMS, etc.).
-   **`Logs`**: Captures audit and diagnostic records.

This structure gave us the best of both worlds. We gained architectural clarity and avoided accidental coupling, as communication between these modules is governed by strict rules, as if they were separate services.

## Phase 3: Defining the Rules of the Game

For a Modular Monolith to work, it is crucial to enforce architectural discipline. We defined some non-negotiable rules:

1.  **Explicit Communication:** Modules cannot directly access the internal classes or the database of others. All communication must occur through well-defined public contracts, primarily through an **event-driven architecture** (ADR-0014). This ensures decoupling.

2.  **Clean Architecture on the Write Side (ADR-0010):** For complex operations that change the state of the system (the "command side"), we adopted the Clean Architecture. Dependencies always point inwards, protecting our **Rich Domain Model** (ADR-0011) from infrastructure concerns.

3.  **Automated Architecture Tests (ADR-0017):** Trust is not enough. We use the **ArchUnit** library to create tests that ensure our dependency rules are not violated. If a developer tries to make the `PropertyManagement` module directly dependent on an internal class of the `Administration` module, the build will fail. This prevents architectural degradation over time.

## Results and the Path to the Future

The Modular Monolith approach allowed us to build Keystone quickly and cohesively. Our team was able to focus on business logic without the overhead of managing a distributed infrastructure from day one.

Most importantly, we are not trapped. Since our modules are already decoupled and communicate through events, the process of extracting one of them into a microservice in the future becomes a well-defined and low-risk task, rather than a massive rewrite. If the `Notification` module grows in complexity, we can promote it to an independent service with minimal impact on the rest of the system.

## Conclusion

Choosing an architecture is about managing trade-offs. The Modular Monolith, guided by the principles of DDD, has proven to be a powerful strategy for Keystone. It gave us the solid foundation and speed we needed to get started, without sacrificing the flexibility and scalability we will need tomorrow. It is proof that, sometimes, the most pragmatic path is also the smartest.

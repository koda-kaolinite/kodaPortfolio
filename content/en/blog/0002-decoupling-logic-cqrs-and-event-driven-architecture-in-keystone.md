---
title: "Decoupling Logic: CQRS and Events at the Heart of Keystone"
description: "A technical dive into how we separated read and write responsibilities with CQRS and built a reactive and resilient system using an event-driven architecture, including our journey from a custom event bus to the native Spring solution."
date: 2025-06-22
image: https://images.pexels.com/photos/326576/pexels-photo-326576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 12
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/Vdeo_Animado_Pronto-ezgif.webp
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

In complex systems, the needs for writing data (commands) and reading data (queries) are fundamentally different. Write operations require rich validations, business logic, and transactional consistency, while read operations generally need to be fast, flexible, and optimized for display. Trying to use a single model for both tasks leads to compromises and complexity.

In the Keystone project, we solved this challenge by adopting two powerful patterns in conjunction: **Command Query Responsibility Segregation (CQRS)** and an **Event-Driven Architecture**. Let's explore how these patterns shape the flow of data in our system.

## Phase 1: Separating the Paths with CQRS (ADR-0006)

The principle of CQRS is simple: separate the model you use to change the state of the system from the model you use to query it.

### The Command Side (Write Model)

For the write side, we implemented the **Clean Architecture** (ADR-0010) with a **Rich Domain Model** (ADR-0011). This means that:

-   **Commands** are objects that represent an intention of change (e.g., `CreatePropertyCommand`, `DisableImageCommand`).
-   **Command Handlers** in the Application layer orchestrate the logic.
-   **Aggregates** from DDD (like our `Property` aggregate) contain the actual business logic. They are responsible for protecting their own rules (invariants) and ensuring that the state is always consistent. When a command is executed, it loads an aggregate, invokes a business method, and the aggregate, in turn, registers one or more **Domain Events**.

### The Query Side (Read Model)

For the read side, simplicity and performance are king. We adopted a **two-tier architecture** (ADR-0009):

-   **Queries** are objects that describe the desired data (e.g., `PageableSearchQuery`).
-   **Query Handlers** receive these queries and access the data source directly, often using projections or optimized SQL to build **DTOs (Data Transfer Objects)**.

This separation allows us to optimize each side independently. The write model can be complex and robust, while the read model can be flat, denormalized, and extremely fast, without the overhead of the domain model.

## Phase 2: Connecting the Modules with Events (ADR-0014)

With the business modules well-defined in our Modular Monolith, we needed a form of communication that did not create direct coupling. The solution was **asynchronous and event-driven communication**.

When an important action occurs in a module (for example, a property is created in the `PropertyManagement` module), instead of directly calling other modules, the `CommandHandler` publishes a **Domain Event** (e.g., `PropertyCreatedEvent`).

Other modules can then "listen" to these events and react to them. For example, the `Logs` module can listen to the `PropertyCreatedEvent` to create an audit record. The `PropertyManagement` module does not need to know which or how many modules are interested in its events. This gives us a highly decoupled and extensible system.

## Phase 3: The Evolution of Our Event Bus (ADR-0027)

Initially, we implemented our own in-memory event buses (`CommandBus`, `QueryBus`). However, we faced a persistent and frustrating problem: `IllegalStateException: No handler for class...`. This failure occurred due to the complexity of resolving the generic types of our handlers when Spring AOP applied proxies (for example, for transactions with `@Transactional`).

After several attempts to work around the problem, we made a pragmatic decision: **we abandoned our custom buses and migrated to the native event system of the Spring Framework**.

The new approach is much simpler and more robust:
1.  Our `Commands` and `Queries` now inherit from `org.springframework.context.ApplicationEvent`.
2.  The `ModuleClient`, our facade for communication, simply injects the `ApplicationEventPublisher` from Spring and publishes the events.
3.  Our `CommandHandlers` and `QueryHandlers` have become standard Spring components, with methods annotated with `@EventListener` (or `@TransactionalEventListener`).

This change eliminated an entire layer of complexity and fragility, aligning our project with idiomatic Spring practices and allowing us to focus on business logic, not infrastructure.

## Phase 4: Ensuring Consistency for the Client (ADR-0024)

A challenge of asynchronous persistence via events is client-side consistency. The `CommandHandler` could return an "OK" to the client before the `EventListener` saved the data to the database. If the persistence failed, the client would have an ID for a resource that was never saved.

We solved this with an elegant "blocking for result" pattern using `CompletableFuture`:
1.  The `CommandHandler` creates an incomplete `CompletableFuture`.
2.  This `future` is passed to the aggregate and included in the domain event (e.g., `PropertyCreatedEvent`).
3.  The `CommandHandler` returns this `future` immediately, but the client's HTTP request remains pending, awaiting its completion.
4.  The `TransactionalEventListener`, **after** successfully saving the data to the database, completes the `future` with the result (`future.complete(result)`).
5.  Only then is the HTTP response sent to the client. If the persistence fails, the `future` is completed with an exception, which is propagated as an error to the client.

## Conclusion

The combination of CQRS, an event-driven architecture, and the intelligent use of `CompletableFuture` has given us a robust, decoupled, and consistent system. We have been able to optimize write and read operations independently, ensure resilient communication between modules, and, most importantly, provide a consistent and reliable experience for the end user, even with the complexity of asynchronous persistence under the hood.

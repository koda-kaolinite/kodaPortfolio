---
title: "Optimizing Performance in Keystone with GraalVM and ULIDs"
description: "Performance is not an accident, it's a design decision. We explore two crucial optimizations in Keystone: the adoption of GraalVM for native, low-consumption execution, and the migration from UUIDs to ULIDs to resolve database performance bottlenecks."
date: 2025-08-03
image: https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 11
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/Vdeo_Animado_Pronto-ezgif.webp
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Building robust software goes beyond writing correct business logic. In a cloud environment, where efficiency translates directly into operational costs and user experience, performance is a first-class feature. In the Keystone project, we made deliberate architectural decisions to ensure that our Java application with Spring Boot was not only functional, but also extremely performant.

In this article, we will dive into two of these key decisions: the choice of **GraalVM** as our execution platform and the replacement of **UUIDs** with **ULIDs** as our unique identifier standard.

## Phase 1: The Foundation - Java, Spring, and the GraalVM Advantage (ADR-0003)

Our choice of the Java stack with Spring Boot was natural, given the maturity, robust ecosystem, and productivity it offers. However, we wanted to extract the maximum possible performance. This is where **GraalVM** comes into play.

GraalVM is a high-performance JDK that offers an advanced Just-In-Time (JIT) compiler. But its most transformative feature for us is the ability to compile Java applications into a **native image** (Ahead-Of-Time compilation).

**Why is this so important?**
-   **Almost Instant Startup:** Traditional Spring Boot applications can take several seconds to start, as the JVM needs to load classes, perform component scanning, and build the application context. A native image already has all of this pre-calculated. The result is a startup time measured in milliseconds, ideal for auto-scaling environments and serverless functions when needed.
-   **Lower Memory Consumption:** Native images consume a fraction of the memory of a Java application running on the JVM. In a cloud environment where we pay for resources, this means a direct cost reduction and the ability to run more instances on smaller hardware.
-   **Optimized Package:** The native compilation process performs an aggressive analysis of dead code, resulting in a final executable that contains only the classes and methods strictly necessary for the application to run.

Adopting GraalVM (via `org.springframework.boot:spring-boot-starter-parent` with native support) was a strategic decision to make our application truly cloud-native.

## Phase 2: The Silent Bottleneck in the Database

While GraalVM optimized our application, we identified another potential performance bottleneck, this time in the persistence layer. Like many projects, we started by using `java.util.UUID` (version 4, random) as the primary key for our entities in PostgreSQL.

UUIDs are great for ensuring global uniqueness. However, their completely random nature is poison for the write performance of databases that use B-Tree indexes, like PostgreSQL.

**The Problem:**
Every time a new `Property` was inserted, its random UUID was inserted into a random position in the primary key index. This forces the database to constantly split the index pages to accommodate the new value, a phenomenon called **index fragmentation**. As the table grows, `INSERT` operations become progressively slower.

## Phase 3: The Elegant Solution - ULIDs (ADR-0022)

The solution was to adopt the **ULID (Universally Unique Lexicographically Sortable Identifier)**. The ULID is a standard that combines the best of both worlds:
-   The first 48 bits are a **timestamp** (date and time in milliseconds).
-   The remaining 80 bits are **random**.

This structure ensures that ULIDs are **monotonically increasing**. When new records are inserted, their IDs are always greater than the previous ones, which means they are simply appended to the end of the B-Tree index. Index fragmentation is eliminated.

**Our Pragmatic Implementation:**
A complete migration from `UUID` to `ULID` (which is canonically a string) would be costly. Instead, we adopted a clever approach:
1.  We added the `com.github.f4b6a3:ulid-creator` library.
2.  When creating a new entity, we generate a ULID and convert it to the `java.util.UUID` type using `UlidCreator.getMonotonicUlid().toUuid()`.
3.  **We kept the column type in the database as native `UUID`.**

This way, we obtained all the performance benefits of ULIDs (sequential insertions in the index) without needing any changes to the database schema or the code that already consumed the `UUID` type.

## Conclusion

Optimizing performance is a holistic job. It's no use having fast application code if the database becomes a bottleneck, and vice versa. In Keystone, the combination of native image compilation with **GraalVM** and the adoption of **ULIDs** for our primary keys has given us a solid foundation for a system that is not only robust in its logic, but also lean, fast, and efficient in its execution, from the application to the persistence.

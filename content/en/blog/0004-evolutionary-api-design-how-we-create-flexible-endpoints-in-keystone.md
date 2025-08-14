---
title: "Evolutionary API Design: How We Create Flexible Endpoints in Keystone"
description: "A good API is a good product. We analyze the design of the Keystone API, focusing on how we handle polymorphic requests for different property types using a single endpoint and how we manage the asynchronicity of the backend with CompletableFuture."
date: 2025-07-06
image: https://images.pexels.com/photos/50614/pexels-photo-50614.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 10
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

The API layer is the gateway to your application. Its design directly impacts the experience of client developers (whether they are from a frontend team or an external system) and the ability of your system to evolve. A well-designed API is flexible, intuitive, and hides internal complexity.

In Keystone, we faced two interesting design challenges in our `property` API: how to handle the creation of multiple property types cleanly and how to interact with our asynchronous backend without sacrificing consistency for the client.

## Challenge 1: The Polymorphism Problem

As discussed in our post about the "Details Pattern", our system supports various types of properties (`House`, `Apartment`, `Warehouse`, etc.). How should the API reflect this?

At first, we thought the approach would be to create an endpoint for each type:
-   `POST /api/houses`
-   `POST /api/apartments`
-   `POST /api/warehouses`

This would lead to an explosion of endpoints, code duplication in the controllers, and an API surface that is difficult to maintain and discover.

### The Solution: Polymorphic Requests (ADR-0026)

Our solution was to use a **single endpoint** (`POST /api/property`) and a **polymorphic request**. The request body contains a field that discriminates the type, and the rest of the body is interpreted based on that type.

Thanks to Jackson (the default JSON serialization library in Spring), we can model this elegantly with annotations. Our `CreatePropertyRequest` DTO looks like this:

```java
// CreatePropertyRequest.java
@Getter
public class CreatePropertyRequest {

    private PropertyType propertyType; // Ex: "HOUSE", "WAREHOUSE"

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
            property = "propertyType" // Jackson uses this field to decide
    )
    @JsonSubTypes({ // Maps the value of propertyType to a class
            @JsonSubTypes.Type(value = CreateHouseRequest.class, name = "HOUSE"),
            @JsonSubTypes.Type(value = CreateWareHouseRequest.class, name = "WAREHOUSE"),
            // ... other types
    })
    private CreateDetailsRequest details;
}
```

A client can now create any type of property on the same endpoint, just by changing the request body. For example, to create a house:

```json
{
  "propertyType": "HOUSE",
  "details": {
    "bedrooms": 4,
    "suites": 2,
    "parkingSpaces": 3,
    "yearBuilt": 2022,
    // ... other fields of a house
  }
}
```

This design is clean, follows the Open/Closed Principle (we can add new types without changing the endpoint), and simplifies the life of the API consumer.

## Challenge 2: Interacting with an Asynchronous Backend

Our backend is event-driven, which means that data persistence happens asynchronously. When the `PropertyController` receives a request, it triggers a command and the persistence is done by a `TransactionalEventListener` in another thread.

This creates a problem: how can the controller return a `201 Created` response with the ID of the new property if the database transaction has not yet been completed?

### The Solution: `CompletableFuture` in the API Layer (ADR-0024)

We solved this by having our controller methods return a `CompletableFuture<ResponseEntity<?>>`.

See the signature of our creation method:
```java
// PropertyController.java
@PostMapping
public CompletableFuture<ResponseEntity<UUID>> createProperty(@RequestBody CreatePropertyRequest request) {
    // ...
}
```

The flow works as follows:
1.  The `Controller` receives the request.
2.  It creates a `CompletableFuture` and passes it to the `ModuleClient` along with the command.
3.  The `ModuleClient` returns this `future` immediately to the `Controller`, which in turn returns it to the Spring Web engine.
4.  At this point, the request thread is released, but the connection to the client remains open, awaiting the completion of the `future`.
5.  Back in the backend, when the `TransactionalEventListener` finally saves the property to the database, it completes the `future` with the `UUID` of the new property.
6.  As soon as the `future` is completed, Spring Web "wakes up", assembles the `ResponseEntity` with the status `201` and the `UUID`, and sends the final response to the client.

This pattern gives us the best of both worlds: a reactive and decoupled backend, and an API that behaves synchronously and consistently from the client's point of view.

## Conclusion

The design of an API is an art of balancing flexibility, simplicity, and robustness. In Keystone, the use of polymorphic requests allowed us to create a scalable and easy-to-use API, while the use of `CompletableFuture` allowed us to expose a synchronous and consistent interface over a fundamentally asynchronous backend. These decisions ensure that our API is not just a data channel, but a well-designed software product in itself.

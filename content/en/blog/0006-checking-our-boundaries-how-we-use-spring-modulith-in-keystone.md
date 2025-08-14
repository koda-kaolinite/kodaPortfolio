---
title: "Checking Our Boundaries: How We Use Spring Modulith in Keystone"
description: "Good fences make good neighbors. In a Modular Monolith, discipline is crucial. Discover how we use Spring Modulith to test, document, and ensure that the boundaries between our business modules remain intact."
date: 2025-07-20
image: https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 9
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: "Animated gif of Koda in pixelart"
---

**Important:** Throughout the article, the term `ADR` will be mentioned multiple times, which stands for `Architecture Decision Records`. You can read each project ADR [Here](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

One of the biggest risks of a Modular Monolith architecture is the erosion of its internal boundaries. In a single codebase, with the pressure of day-to-day work, it is tempting for a developer to create a shortcut and have one module directly access an internal component of another. The compiler will not complain, but each of these shortcuts is a crack in the foundation of our architecture, introducing coupling and making future maintenance a nightmare.

In the Keystone project, we do not rely solely on team discipline. We automate the surveillance of our borders using a powerful tool from the Spring ecosystem: **Spring Modulith**.

## The Challenge: Keeping Modules Truly Modular

Our architecture, defined in multiple ADRs, decrees that business modules like `Property` and `Administration` are independent and should only communicate through public contracts (like events or DTOs).

However, in practice, what prevents a `Service` from the administration module from injecting and directly using a `Repository` from the property module? Without a specific tool, the answer would be: "only code review." And that is not enough.

We needed a way to programmatically ensure that the encapsulation rules between modules were respected.

## The Solution: Spring Modulith in Action

Spring Modulith is a project that supports developers in creating well-structured and modular Spring Boot applications. It is not a framework that imposes a way of working, but rather a collection of tools that observe your application and help it follow the principles you have defined yourself.

In our `build.gradle`, we ensure that the essential Modulith dependencies are present:
```groovy
// build.gradle
implementation 'org.springframework.modulith:spring-modulith-starter-core'
testImplementation 'org.springframework.modulith:spring-modulith-starter-test'
```

With this, we gain two crucial capabilities: verification at test time and living documentation.

### 1. Module Verification with Tests

This is the most powerful feature for us. Spring Modulith allows us to write a simple integration test that checks the health of our modularity.

By default, Modulith considers each direct subpackage of the application's main package as a module. In our case, packages like `com.ts.keystone.api.property` and `com.ts.keystone.api.administration` are treated as distinct modules.

We created an architecture test that verifies if the dependencies between these modules are in accordance with our rules:

```java
import com.ts.keystone.api.KeystoneApplication;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularityTest {

    // Loads the module definition from our main class
    ApplicationModules modules = ApplicationModules.of(KeystoneApplication.class);

    @Test
    void shouldRespectModuleBoundaries() {
        // The verify() method checks for illegal dependencies
        // between modules. A dependency is illegal if a class
        // accesses a type from another module that is not exported
        // (i.e., is not in a publicly defined package).
        modules.verify();
    }
}
```

This single test, which runs in our CI/CD pipeline, is our main line of defense. If a developer creates an improper dependency, the `shouldRespectModuleBoundaries` test will fail, breaking the build. This transforms a potential silent architecture error into an explicit and immediate compilation error.

### 2. Living Documentation

The second great benefit is the ability of Spring Modulith to generate documentation from the actual structure of the code. It can create C4 or PlantUML diagrams that show the modules and their interdependencies.

This means that our architecture diagrams never become outdated. They are a faithful reflection of the current state of the code, generated as part of the build process. This aligns perfectly with our philosophy of "Architecture as Code."

## Conclusion

Spring Modulith is an essential tool in our utility belt at Keystone. It acts as an automated border guard, ensuring that the modular structure we planned so carefully in the ADRs is the structure that actually exists in the source code.

By providing us with verification tests and living documentation, Modulith gives us the confidence to scale and maintain our Modular Monolith, knowing that its foundations are protected from the natural erosion that afflicts so many long-running software projects. We are not just hoping that our architecture remains clean; we are ensuring it with every build.

---
title: "Além do Código: Otimizando a Performance no Keystone com GraalVM e ULIDs"
description: "Performance não é um acaso, é uma decisão de design. Exploramos duas otimizações cruciais no Keystone: a adoção da GraalVM para uma execução nativa e de baixo consumo, e a migração de UUIDs para ULIDs para resolver gargalos de performance no banco de dados."
date: 2025-08-03
image: https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 11
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Construir um software robusto vai além de escrever uma lógica de negócio correta. Em um ambiente de nuvem, onde a eficiência se traduz diretamente em custos operacionais e experiência do usuário, a performance é uma feature de primeira classe. No projeto Keystone, tomamos decisões arquiteturais deliberadas para garantir que nossa aplicação Java com Spring Boot não fosse apenas funcional, mas também extremamente performática.

Neste artigo, vamos mergulhar em duas dessas decisões-chave: a escolha da **GraalVM** como nossa plataforma de execução e a substituição de **UUIDs** por **ULIDs** como nosso padrão de identificador único.

## Fase 1: A Base - Java, Spring e a Vantagem da GraalVM (ADR-0003)

Nossa escolha pela stack Java com Spring Boot foi natural, dada a maturidade, o ecossistema robusto e a produtividade que ela oferece. No entanto, queríamos extrair o máximo de performance possível. É aqui que a **GraalVM** entra em cena.

A GraalVM é uma JDK de alta performance que oferece um compilador Just-In-Time (JIT) avançado. Mas sua funcionalidade mais transformadora para nós é a capacidade de compilar aplicações Java para uma **imagem nativa** (Ahead-Of-Time compilation).

**Por que isso é tão importante?**
-   **Startup Quase Instantâneo:** Aplicações Spring Boot tradicionais podem levar vários segundos para iniciar, pois a JVM precisa carregar classes, fazer component scanning e construir o contexto da aplicação. Uma imagem nativa já tem tudo isso pré-calculado. O resultado é um tempo de inicialização medido em milissegundos, ideal para ambientes de auto-scaling e funções serverless quando for necessário.
-   **Menor Consumo de Memória:** Imagens nativas consomem uma fração da memória de uma aplicação Java rodando na JVM. Em um ambiente de nuvem onde pagamos por recursos, isso significa uma redução de custos direta e a capacidade de rodar mais instâncias em hardware menor.
-   **Pacote Otimizado:** O processo de compilação nativa realiza uma análise agressiva de código morto (dead code), resultando em um executável final que contém apenas as classes e métodos estritamente necessários para a aplicação rodar.

Adotar a GraalVM (via `org.springframework.boot:spring-boot-starter-parent` com o suporte nativo) foi uma decisão estratégica para tornar nossa aplicação cloud-native de verdade.

## Fase 2: O Gargalo Silencioso no Banco de Dados

Enquanto a GraalVM otimizava nossa aplicação, identificamos outro potencial gargalo de performance, desta vez na camada de persistência. Como muitos projetos, começamos usando `java.util.UUID` (versão 4, aleatória) como chave primária de nossas entidades no PostgreSQL.

UUIDs são ótimos para garantir unicidade global. No entanto, sua natureza completamente aleatória é um veneno para o desempenho de escrita em bancos de dados que usam índices B-Tree, como o PostgreSQL.

**O Problema:**
Toda vez que uma nova `Property` era inserida, seu UUID aleatório era inserido em uma posição aleatória no índice da chave primária. Isso força o banco de dados a constantemente dividir as páginas do índice para acomodar o novo valor, um fenômeno chamado **fragmentação de índice**. Com o crescimento da tabela, as operações de `INSERT` se tornam progressivamente mais lentas.

## Fase 3: A Solução Elegante - ULIDs (ADR-0022)

A solução foi adotar o **ULID (Universally Unique Lexicographically Sortable Identifier)**. O ULID é um padrão que combina o melhor dos dois mundos:
-   Os primeiros 48 bits são um **timestamp** (data e hora em milissegundos).
-   Os 80 bits restantes são **aleatórios**.

Essa estrutura garante que os ULIDs sejam **monotonicamente crescentes**. Quando novos registros são inseridos, seus IDs são sempre maiores que os anteriores, o que significa que eles são simplesmente anexados ao final do índice B-Tree. A fragmentação do índice é eliminada.

**Nossa Implementação Pragmática:**
Uma migração completa de `UUID` para `ULID` (que é canonicamente uma string) seria custosa. Em vez disso, adotamos uma abordagem inteligente:
1.  Adicionamos a biblioteca `com.github.f4b6a3:ulid-creator`.
2.  Ao criar uma nova entidade, geramos um ULID e o convertemos para o tipo `java.util.UUID` usando `UlidCreator.getMonotonicUlid().toUuid()`.
3.  **Mantivemos o tipo da coluna no banco de dados como `UUID` nativo.**

Dessa forma, obtivemos todos os benefícios de performance dos ULIDs (inserções sequenciais no índice) sem precisar de qualquer alteração no schema do banco ou no código que já consumia o tipo `UUID`.

## Conclusão

Otimizar a performance é um trabalho holístico. Não adianta ter um código de aplicação rápido se o banco de dados se tornar um gargalo, e vice-versa. No Keystone, a combinação da compilação para imagem nativa com a **GraalVM** e a adoção de **ULIDs** para nossas chaves primárias nos deu uma base sólida para um sistema que não é apenas robusto em sua lógica, mas também enxuto, rápido e eficiente em sua execução, da aplicação à persistência.

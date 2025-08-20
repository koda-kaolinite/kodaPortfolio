---
title: "Construindo o Keystone: Por que Escolhemos um Monólito Modular?"
description: "Uma análise sobre minha decisão estratégica de iniciar com uma arquitetura de Monólito Modular, combinando a velocidade de desenvolvimento de um monolito com a escalabilidade futura de microsserviços através do Domain-Driven Design."
date: 2025-06-15
image: https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 10
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/20250809_2318_Homem com Fones_remix_01k28w7xx5ehz85pss8pqtxek5-1.webp
    alt: Gif animado do Koda em pixelart
---

Ao iniciar um novo projeto de software, uma das primeiras e mais impactantes decisões é a escolha da arquitetura. O debate "Monólito vs. Microsserviços" é onipresente, com cada abordagem apresentando um conjunto distinto de trade-offs. Para o projeto Keystone, nossa plataforma de gerenciamento de imóveis, optamos por um caminho pragmático e estratégico: o **Monólito Modular**.

Neste artigo, vou detalhar por que essa abordagem foi a escolha certa para nós, como o **Domain-Driven Design (DDD)** se tornou a espinha dorsal da nossa estrutura e como estamos preparados para o futuro sem a complexidade inicial dos microsserviços.

## Antes de tudo: ADRs - O Registro de Nossas Decisões

O "porquê" por trás de uma decisão arquitetural é tão importante quanto a decisão em si. Para capturar esse contexto, utilizamos **Architectural Decision Records (ADRs)**. Cada ADR é um documento curto em markdown que descreve:
1.  **Contexto:** O problema ou a força que nos levou a tomar uma decisão.
2.  **Decisão:** A descrição da escolha que fizemos.
3.  **Consequências:** Os resultados, trade-offs e implicações da nossa decisão.

Nossos ADRs são o registro histórico do nosso pensamento. Eles ajudam novos membros da equipe a entender por que o sistema é como é e fornecem uma base racional para futuras evoluções.

Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

## Fase 1: O Dilema Arquitetural

A promessa dos microsserviços é sedutora: escalabilidade independente, autonomia de equipe e resiliência. No entanto, essa abordagem vem com um custo significativo em complexidade operacional, infraestrutura e comunicação entre serviços. Iniciar um projeto com essa sobrecarga pode ser fatal, um fenômeno conhecido como "imposto dos microsserviços".

Por outro lado, um monólito tradicional, embora simples de implantar e desenvolver inicialmente, corre o risco de se tornar uma "grande bola de lama" (Big Ball of Mud) — um sistema acoplado, frágil e difícil de manter.

Nossa meta era encontrar um equilíbrio: a simplicidade de um único deploy e a velocidade de desenvolvimento de um monólito, mas com as fronteiras internas claras e o baixo acoplamento de um sistema distribuído.

## Fase 2: A Decisão pelo Monólito Modular (ADR-0002)

Decidimos adotar uma arquitetura de **Monólito Modular**. Em essência, o sistema é construído e implantado como um único processo, mas seu código-fonte é organizado em módulos independentes e altamente coesos.

A principal diretriz para essa divisão não foi técnica, mas de negócio. Utilizamos os princípios do **Domain-Driven Design (DDD)** para decompor o sistema em **Bounded Contexts** (Contextos Delimitados), onde cada módulo representa um subdomínio de negócio específico.

Para o Keystone, isso se traduziu nos seguintes módulos (ADR-0004):

-   **`Property`**: O coração do sistema, responsável pelo ciclo de vida completo de um imóvel.
-   **`Administration`**: Gerencia identidade, acesso, permissões e usuários internos.
-   **`Files`**: Lida com armazenamento, recuperação e processamento de mídias, como fotos e documentos.
-   **`Notification`**: Centraliza o envio de notificações (e-mail, SMS, etc.).
-   **`Logs`**: Captura registros de auditoria e diagnóstico.

Essa estrutura nos deu o melhor dos dois mundos. Ganhamos clareza arquitetural e evitamos o acoplamento acidental, pois a comunicação entre esses módulos é regida por regras estritas, como se fossem serviços separados.

## Fase 3: Definindo as Regras do Jogo

Para que um Monólito Modular funcione, é crucial impor disciplina arquitetural. Definimos algumas regras não negociáveis:

1.  **Comunicação Explícita:** Módulos não podem acessar diretamente as classes internas ou o banco de dados uns dos outros. Toda comunicação deve ocorrer através de contratos públicos bem definidos, primariamente por meio de uma **arquitetura orientada a eventos** (ADR-0014). Isso garante o desacoplamento.

2.  **Clean Architecture no Lado da Escrita (ADR-0010):** Para operações complexas que alteram o estado do sistema (o "lado do comando"), adotamos a Clean Architecture. As dependências sempre apontam para dentro, protegendo nosso **Rich Domain Model** (ADR-0011) de preocupações de infraestrutura.

3.  **Testes de Arquitetura Automatizados (ADR-0017):** A confiança não é suficiente. Usamos a biblioteca **ArchUnit** para criar testes que garantem que nossas regras de dependência não sejam violadas. Se um desenvolvedor tentar fazer com que o módulo `PropertyManagement` dependa diretamente de uma classe interna do módulo `Administration`, a build falhará. Isso previne a degradação arquitetural ao longo do tempo.

## Resultados e o Caminho para o Futuro

A abordagem de Monólito Modular nos permitiu construir o Keystone de forma rápida e coesa. Nossa equipe pôde se concentrar na lógica de negócio sem a sobrecarga de gerenciar uma infraestrutura distribuída desde o primeiro dia.

O mais importante é que não estamos presos. Como nossos módulos já são desacoplados e se comunicam por eventos, o processo de extrair um deles para um microsserviço no futuro torna-se uma tarefa bem definida e de risco calculado, em vez de uma reescrita massiva. Se o módulo `Notification` crescer em complexidade, podemos promovê-lo a um serviço independente com impacto mínimo no resto do sistema.

## Conclusão

A escolha de uma arquitetura é sobre gerenciar trade-offs. O Monólito Modular, guiado pelos princípios do DDD, provou ser uma estratégia poderosa para o Keystone. Ele nos deu a base sólida e a velocidade de que precisávamos para começar, sem sacrificar a flexibilidade e a escalabilidade de que precisaremos amanhã. É uma prova de que, às vezes, o caminho mais pragmático é também o mais inteligente.

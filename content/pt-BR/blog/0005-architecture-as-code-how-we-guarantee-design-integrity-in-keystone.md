---
title: "Arquitetura como Código: Como Garantimos a Integridade do Design no Keystone"
description: "Diagramas se desatualizam, mas o código não mente. Veja como usamos uma combinação de Linguagem Ubíqua do DDD, testes de arquitetura com ArchUnit e ADRs para transformar nossas regras de design em artefatos vivos e executáveis, prevenindo a degradação arquitetural."
date: 2025-07-13
image: https://images.pexels.com/photos/693857/pexels-photo-693857.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 10
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Uma das verdades mais difíceis no desenvolvimento de software é que a arquitetura, por mais bem planejada que seja, tende a se degradar com o tempo. Novas funcionalidades, prazos apertados e a entrada de novos desenvolvedores podem, gradualmente, erodir as fronteiras e os princípios estabelecidos no início do projeto. Diagramas em uma wiki ficam desatualizados e as boas intenções se perdem.

No projeto Keystone, combatemos essa entropia tratando nossa **arquitetura como código**. Adotamos uma abordagem de três pilares para garantir que nosso design não seja apenas um plano, mas uma realidade viva e fiscalizada a cada commit.

## Pilar 1: A Linguagem Ubíqua - Nosso Contrato Social (ADR-0018)

O primeiro passo para a integridade é garantir que todos (desenvolvedores, analistas de negócio, stakeholders) falem a mesma língua. Adotamos o conceito de **Linguagem Ubíqua (Ubiquitous Language)** do Domain-Driven Design (DDD) como nossa base.

Isso significa que os termos usados para descrever o negócio são os mesmos termos que usamos no código.
-   Um corretor de imóveis é um `Property Broker` no código.
-   Um administrador da plataforma é um `Platform Administrator`.
-   Um imóvel é uma `Property`.

Essa linguagem unificada, definida formalmente em nosso **ADR-0018**, é a nossa fonte da verdade. Ela elimina ambiguidades e reduz a carga cognitiva. Quando um requisito de negócio fala sobre uma `Property`, o desenvolvedor sabe exatamente qual agregado, repositório e eventos procurar. O código se torna auto-documentado e reflete diretamente o domínio do negócio.

## Pilar 2: Testes de Arquitetura com ArchUnit - O Fiscal Automatizado (ADR-0017)

A Linguagem Ubíqua é o nosso contrato social, mas precisamos de um mecanismo para garantir que as regras sejam seguidas. O compilador Java não pode impedir um desenvolvedor de, por engano, fazer a camada de Domínio depender da camada Web, violando um princípio fundamental da Clean Architecture.

É aqui que entra o **ArchUnit**. ArchUnit é uma biblioteca Java gratuita que nos permite escrever testes unitários para a nossa arquitetura. Em vez de testar a lógica de negócio, testamos a estrutura do próprio código.

Em nosso pipeline de integração contínua, temos testes que verificam regras como:
-   **Proteção das Camadas:** "Nenhuma classe na camada de `domain` pode acessar classes da camada de `infrastructure` ou `webAdapter`."
-   **Independência dos Módulos:** "Classes no módulo `Property` não podem depender diretamente de classes internas do módulo `Administration`."
-   **Sufixos de Nomenclatura:** "Classes que implementam `IPropertyRepository` devem ter o sufixo `RepositoryImpl`."
-   **Uso de Anotações:** "A anotação `@Transactional` só pode ser usada em classes nas camadas de `application` ou `infrastructure`, nunca no `domain`."

Se uma dessas regras for violada, a build falha. Isso transforma a governança arquitetural de uma revisão manual e propensa a erros em um processo automatizado, imediato e inegociável.

## Conclusão

Manter a integridade de uma arquitetura não acontece por acaso. É um esforço deliberado e contínuo. No Keystone, a combinação de uma **Linguagem Ubíqua** (o contrato), **testes com ArchUnit** (a fiscalização) e **ADRs** (o registro histórico) nos dá a confiança de que nosso sistema pode crescer e evoluir de forma saudável. Não estamos apenas construindo software; estamos construindo um sistema projetado para durar, com sua qualidade e design protegidos por código.

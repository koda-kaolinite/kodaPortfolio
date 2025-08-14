---
title: "Desacoplando a Lógica: CQRS e Eventos no Coração do Keystone"
description: "Um mergulho técnico em como separamos as responsabilidades de leitura e escrita com CQRS e construímos um sistema reativo e resiliente usando uma arquitetura orientada a eventos, incluindo nossa jornada de um event bus customizado para a solução nativa do Spring."
date: 2025-06-22
image: https://images.pexels.com/photos/326576/pexels-photo-326576.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 12
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Em sistemas complexos, as necessidades de escrita de dados (comandos) e de leitura de dados (consultas) são fundamentalmente diferentes. As operações de escrita exigem validações ricas, lógica de negócio e consistência transacional, enquanto as operações de leitura geralmente precisam ser rápidas, flexíveis e otimizadas para exibição. Tentar usar um único modelo para ambas as tarefas leva a compromissos e complexidade.

No projeto Keystone, resolvemos esse desafio adotando dois padrões poderosos em conjunto: **Command Query Responsibility Segregation (CQRS)** e uma **Arquitetura Orientada a Eventos**. Vamos explorar como esses padrões moldam o fluxo de dados em nosso sistema.

## Fase 1: Separando os Caminhos com CQRS (ADR-0006)

O princípio do CQRS é simples: separe o modelo que você usa para alterar o estado do sistema do modelo que você usa para consultá-lo.

### O Lado do Comando (Write Model)

Para o lado da escrita, implementamos a **Clean Architecture** (ADR-0010) com um **Rich Domain Model** (ADR-0011). Isso significa que:

-   **Comandos** são objetos que representam uma intenção de mudança (ex: `CreatePropertyCommand`, `DisableImageCommand`).
-   **Command Handlers** na camada de Aplicação orquestram a lógica.
-   **Agregados** do DDD (como nosso agregado `Property`) contêm a lógica de negócio real. Eles são responsáveis por proteger suas próprias regras (invariantes) e garantir que o estado seja sempre consistente. Quando um comando é executado, ele carrega um agregado, invoca um método de negócio e o agregado, por sua vez, registra um ou mais **Domain Events**.

### O Lado da Consulta (Read Model)

Para o lado da leitura, a simplicidade e a performance são reis. Adotamos uma **arquitetura de duas camadas** (ADR-0009):

-   **Queries** são objetos que descrevem os dados desejados (ex: `PageableSearchQuery`).
-   **Query Handlers** recebem essas consultas e acessam a fonte de dados diretamente, muitas vezes usando projeções ou SQL otimizado para construir **DTOs (Data Transfer Objects)**.

Essa separação nos permite otimizar cada lado de forma independente. O modelo de escrita pode ser complexo e robusto, enquanto o modelo de leitura pode ser plano, desnormalizado e extremamente rápido, sem a sobrecarga do modelo de domínio.

## Fase 2: Conectando os Módulos com Eventos (ADR-0014)

Com os módulos de negócio bem definidos em nosso Monólito Modular, precisávamos de uma forma de comunicação que não criasse acoplamento direto. A solução foi uma **comunicação assíncrona e orientada a eventos**.

Quando uma ação importante ocorre em um módulo (por exemplo, um imóvel é criado no módulo `PropertyManagement`), em vez de chamar diretamente outros módulos, o `CommandHandler` publica um **Domain Event** (ex: `PropertyCreatedEvent`).

Outros módulos podem, então, "ouvir" esses eventos e reagir a eles. Por exemplo, o módulo `Logs` pode ouvir o `PropertyCreatedEvent` para criar um registro de auditoria. O módulo `PropertyManagement` não precisa saber quais ou quantos módulos estão interessados em seus eventos. Isso nos dá um sistema altamente desacoplado e extensível.

## Fase 3: A Evolução do Nosso Event Bus (ADR-0027)

Inicialmente, implementamos nossos próprios barramentos de eventos em memória (`CommandBus`, `QueryBus`). No entanto, enfrentamos um problema persistente e frustrante: `IllegalStateException: No handler for class...`. Essa falha ocorria devido à complexidade de resolver os tipos genéricos dos nossos handlers quando o Spring AOP aplicava proxies (por exemplo, para transações com `@Transactional`).

Após várias tentativas de contornar o problema, tomamos uma decisão pragmática: **abandonamos nossos barramentos customizados e migramos para o sistema de eventos nativo do Spring Framework**.

A nova abordagem é muito mais simples e robusta:
1.  Nossos `Commands` e `Queries` agora herdam de `org.springframework.context.ApplicationEvent`.
2.  O `ModuleClient`, nosso facade para comunicação, simplesmente injeta o `ApplicationEventPublisher` do Spring e publica os eventos.
3.  Nossos `CommandHandlers` e `QueryHandlers` se tornaram componentes Spring padrão, com métodos anotados com `@EventListener` (ou `@TransactionalEventListener`).

Essa mudança eliminou uma camada inteira de complexidade e fragilidade, alinhando nosso projeto com as práticas idiomáticas do Spring e nos permitindo focar na lógica de negócio, não na infraestrutura.

## Fase 4: Garantindo a Consistência para o Cliente (ADR-0024)

Um desafio da persistência assíncrona via eventos é a consistência do lado do cliente. O `CommandHandler` poderia retornar um "OK" para o cliente antes que o `EventListener` salvasse os dados no banco. Se a persistência falhasse, o cliente teria um ID para um recurso que nunca foi salvo.

Resolvemos isso com um padrão elegante de "bloqueio para resultado" usando `CompletableFuture`:
1.  O `CommandHandler` cria um `CompletableFuture` incompleto.
2.  Esse `future` é passado para o agregado e incluído no evento de domínio (ex: `PropertyCreatedEvent`).
3.  O `CommandHandler` retorna esse `future` imediatamente, mas a requisição HTTP do cliente fica pendente, aguardando sua conclusão.
4.  O `TransactionalEventListener`, **após** salvar os dados no banco com sucesso, completa o `future` com o resultado (`future.complete(result)`).
5.  Só então a resposta HTTP é enviada ao cliente. Se a persistência falhar, o `future` é completado com uma exceção, que é propagada como um erro para o cliente.

## Conclusão

A combinação de CQRS, uma arquitetura orientada a eventos e o uso inteligente de `CompletableFuture` nos deu um sistema robusto, desacoplado e consistente. Conseguimos otimizar as operações de escrita e leitura de forma independente, garantir a comunicação resiliente entre os módulos e, o mais importante, fornecer uma experiência consistente e confiável para o usuário final, mesmo com a complexidade da persistência assíncrona sob o capô.

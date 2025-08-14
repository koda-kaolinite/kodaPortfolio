---
title: "Design de API Evolutivo: Como Criamos Endpoints Flexíveis no Keystone"
description: "Uma boa API é um bom produto. Analisamos o design da API do Keystone, focando em como lidamos com requisições polimórficas para diferentes tipos de imóveis usando um único endpoint e como gerenciamos a assincronicidade do backend com CompletableFuture."
date: 2025-07-06
image: https://images.pexels.com/photos/50614/pexels-photo-50614.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 10
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/videos/Vdeo_Animado_Pronto-ezgif.com-optimize.gif
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

A camada de API é a porta de entrada para a sua aplicação. Seu design impacta diretamente a experiência dos desenvolvedores clientes (sejam eles de um time de frontend ou de um sistema externo) e a capacidade do seu sistema de evoluir. Uma API bem projetada é flexível, intuitiva e esconde a complexidade interna.

No Keystone, enfrentamos dois desafios de design interessantes na nossa API de `property`: como lidar com a criação de múltiplos tipos de imóveis de forma limpa e como interagir com nosso backend assíncrono sem sacrificar a consistência para o cliente.

## Desafio 1: O Problema do Polimorfismo

Como discutido em nosso post sobre o "Details Pattern", nosso sistema suporta vários tipos de imóveis (`Casa`, `Apartamento`, `Galpão`, etc.). Como a API deveria refletir isso?

A primeiro momento, pensamos que a abordagem seria criar um endpoint para cada tipo:
-   `POST /api/houses`
-   `POST /api/apartments`
-   `POST /api/warehouses`

Isso levaria a uma explosão de endpoints, duplicação de código nos controllers e uma superfície de API difícil de manter e descobrir.

### A Solução: Requisições Polimórficas (ADR-0026)

Nossa solução foi usar um **único endpoint** (`POST /api/property`) e uma **requisição polimórfica**. O corpo da requisição contém um campo que discrimina o tipo, e o restante do corpo é interpretado com base nesse tipo.

Graças ao Jackson (a biblioteca de serialização JSON padrão do Spring), podemos modelar isso de forma elegante com anotações. Nosso DTO `CreatePropertyRequest` ficou assim:

```java
// CreatePropertyRequest.java
@Getter
public class CreatePropertyRequest {

    private PropertyType propertyType; // Ex: "HOUSE", "WAREHOUSE"

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
            property = "propertyType" // Jackson usa este campo para decidir
    )
    @JsonSubTypes({ // Mapeia o valor de propertyType para uma classe
            @JsonSubTypes.Type(value = CreateHouseRequest.class, name = "HOUSE"),
            @JsonSubTypes.Type(value = CreateWareHouseRequest.class, name = "WAREHOUSE"),
            // ... outros tipos
    })
    private CreateDetailsRequest details;
}
```

Um cliente agora pode criar qualquer tipo de imóvel no mesmo endpoint, apenas mudando o corpo da requisição. Por exemplo, para criar uma casa:

```json
{
  "propertyType": "HOUSE",
  "details": {
    "bedrooms": 4,
    "suites": 2,
    "parkingSpaces": 3,
    "yearBuilt": 2022,
    // ... outros campos de uma casa
  }
}
```

Este design é limpo, segue o princípio Aberto/Fechado (podemos adicionar novos tipos sem mudar o endpoint) e simplifica a vida do consumidor da API.

## Desafio 2: Interagindo com um Backend Assíncrono

Nosso backend é orientado a eventos, o que significa que a persistência de dados acontece de forma assíncrona. Quando o `PropertyController` recebe uma requisição, ele dispara um comando e a persistência é feita por um `TransactionalEventListener` em outro fluxo.

Isso cria um problema: como o controller pode retornar uma resposta `201 Created` com o ID do novo imóvel se a transação do banco de dados ainda não foi concluída?

### A Solução: `CompletableFuture` na Camada da API (ADR-0024)

Resolvemos isso fazendo com que nossos métodos de controller retornem um `CompletableFuture<ResponseEntity<?>>`.

Veja a assinatura do nosso método de criação:
```java
// PropertyController.java
@PostMapping
public CompletableFuture<ResponseEntity<UUID>> createProperty(@RequestBody CreatePropertyRequest request) {
    // ...
}
```

O fluxo funciona da seguinte maneira:
1.  O `Controller` recebe a requisição.
2.  Ele cria um `CompletableFuture` e o passa para o `ModuleClient` junto com o comando.
3.  O `ModuleClient` retorna este `future` imediatamente para o `Controller`, que por sua vez o retorna para o motor do Spring Web.
4.  Neste ponto, o thread da requisição é liberado, mas a conexão com o cliente permanece aberta, aguardando a conclusão do `future`.
5.  Lá no backend, quando o `TransactionalEventListener` finalmente salva o imóvel no banco de dados, ele completa o `future` com o `UUID` do novo imóvel.
6.  Assim que o `future` é completado, o Spring Web "acorda", monta a `ResponseEntity` com o status `201` e o `UUID`, e envia a resposta final para o cliente.

Este padrão nos dá o melhor dos dois mundos: um backend reativo e desacoplado, e uma API que se comporta de forma síncrona e consistente do ponto de vista do cliente.

## Conclusão

O design de uma API é uma arte de equilibrar flexibilidade, simplicidade e robustez. No Keystone, o uso de requisições polimórficas nos permitiu criar uma API escalável e fácil de usar, enquanto o uso de `CompletableFuture` nos permitiu expor uma interface síncrona e consistente sobre um backend fundamentalmente assíncrono. Essas decisões garantem que nossa API não seja apenas um canal de dados, mas um produto de software bem projetado por si só.

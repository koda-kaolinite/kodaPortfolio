---
title: "Além da Herança: Modelando Variações com o Padrão 'Details' no Keystone"
description: "Como evitamos as armadilhas da herança em JPA ao modelar diferentes tipos de imóveis. Um mergulho profundo em nosso padrão de design baseado em composição ('Details Pattern') e como ele mantém nosso domínio limpo e nosso sistema escalável."
date: 2025-06-29
image: https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 11
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/Vdeo_Animado_Pronto-ezgif.webp
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Um dos desafios mais comuns no Domain-Driven Design (DDD) é modelar um conceito de negócio que possui múltiplas variações. Em nosso projeto Keystone, o agregado `Property` (Imóvel) é um exemplo perfeito. Um imóvel pode ser uma `Casa`, um `Apartamento`, um `Galpão` (Warehouse) ou um `Terreno` (Plot). Cada um compartilha atributos comuns (como endereço e preço), mas também possui dados e regras exclusivas: um apartamento tem taxa de condomínio, um galpão tem altura de doca, e assim por diante.

A abordagem tradicional para resolver isso com programação orientada a objetos é a **herança**. No entanto, a herança em conjunto com Object-Relational Mappers (ORMs) como o JPA/Hibernate pode levar a um caminho de dor e complexidade. Neste artigo, vou mostrar como rejeitamos a herança e adotamos um padrão baseado em **Composição sobre Herança** que chamamos de "Details Pattern".

## Fase 1: As Alternativas Problemáticas (ADR-0023)

Antes de chegarmos à nossa solução, consideramos e descartamos duas abordagens comuns:

### Alternativa 1: A Entidade "Deus" com Campos Nulos

A solução mais "simples" seria ter uma única tabela `Property` com todas as colunas possíveis para todos os tipos de imóveis. Um campo `property_type` distinguiria entre eles, e os campos não aplicáveis seriam nulos.

**Por que rejeitamos?**
-   **Schema Poluído:** O banco de dados se torna um campo minado de colunas nulas, tornando as consultas e a manutenção confusas.
-   **Quebra de Invariantes:** Onde você coloca a lógica de que um `Galpão` DEVE ter uma `altura de doca`? A validação vaza para fora do domínio, geralmente em services cheios de `if/switch`, o que é um sintoma clássico de um Anemic Domain Model.
-   **Violação do Princípio Aberto/Fechado:** Adicionar um novo tipo de imóvel exigiria alterar a tabela central e a classe `Property`, um pesadelo de manutenção.

### Alternativa 2: Herança JPA (`TABLE_PER_CLASS` ou `JOINED`)

A solução orientada a objetos "pura" seria `class Apartment extends Property`. O JPA oferece estratégias para mapear essa hierarquia para o banco de dados.

**Por que rejeitamos?**
-   **Complexidade com Agregados DDD:** Onde termina o agregado? A raiz é a classe base `Property`? Como você garante a consistência transacional em uma hierarquia complexa?
-   **Consultas Polimórficas Ineficientes:** Consultar todos os tipos de imóveis de uma vez pode gerar SQL complexo e ineficiente, especialmente com a estratégia `JOINED`.
-   **Rigidez:** A herança cria uma relação "é um" muito forte. E se um conceito de negócio pudesse mudar de tipo? A herança torna isso quase impossível.

## Fase 2: A Solução - Composição com o "Details Pattern"

Nossa solução foi separar completamente os dados compartilhados dos dados específicos de cada tipo, usando composição. A implementação tem duas partes principais, alinhadas com nossa Clean Architecture.

### No Domínio (O Modelo Puro)

Na camada de `domain`, nosso agregado `Property` é um POJO (Plain Old Java Object) limpo.
-   Ele contém apenas os atributos comuns a **todos** os imóveis.
-   Ele tem um enum `PropertyType` para identificar sua natureza.
-   Ele possui um campo genérico: `private Object details;`.

Em tempo de execução, este campo `details` é preenchido com um `record` (POJO imutável) específico e fortemente tipado, como `HouseDetails`, `ApartmentDetails`, etc. O domínio permanece limpo, coeso e totalmente ignorante sobre a persistência.

```java
// Domain Layer
public class Property extends AbstractAggregateRoot<...> {
    private UUID id;
    private PropertyType type;
    private Object details; // Contém HouseDetails, ApartmentDetails, etc.
    // ...
}

public record HouseDetails(...) { /* ... campos específicos de casa ... */ }
```

### Na Infraestrutura (A Persistência JPA)

A mágica acontece na camada de `infrastructure`.
-   A entidade `PropertyJpaEntity` contém os campos comuns.
-   Em vez de herança, ela possui uma relação `@OneToOne` para **cada** tipo de detalhe possível: `private HouseDetails houseDetails;`, `private ApartmentDetails apartmentDetails;`, e assim por diante.
-   Para qualquer imóvel, apenas **uma** dessas relações será preenchida; as outras serão nulas.
-   Usamos `cascade = CascadeType.ALL` e `orphanRemoval = true` para que o ciclo de vida da entidade de detalhes seja totalmente controlado pela `PropertyJpaEntity`.

```java
// Infrastructure Layer
@Entity
public class PropertyJpaEntity {
    @Id private UUID id;
    @Enumerated(EnumType.STRING) private PropertyType type;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "house_details_id")
    private HouseDetails houseDetails; // Entidade JPA de detalhes

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "apartment_details_id")
    private ApartmentDetails apartmentDetails; // Entidade JPA de detalhes

    // ... e assim por diante para todos os tipos
}
```

O `PropertyRepositoryImpl` atua como o tradutor, mapeando entre o agregado de domínio limpo (com seu único objeto `details`) e a `PropertyJpaEntity` (com suas múltiplas relações `@OneToOne` nulas).

## Fase 3: Escalando o Padrão para a API (ADR-0026)

Esse padrão se estendeu até nossa camada de API. Em vez de ter um endpoint para cada tipo de imóvel (`POST /api/house`, `POST /api/apartment`), temos um único endpoint: `POST /api/property`.

A requisição (`CreatePropertyRequest`) é polimórfica. Ela contém o `propertyType` e um campo `details` que o cliente preenche com o JSON do tipo de detalhe correspondente. Usamos um `CreateDetailsMapperRegistry` que descobre em tempo de execução qual `Mapper` usar para converter o DTO de detalhes da requisição no objeto de detalhes do domínio.

Isso significa que para adicionar um novo tipo de imóvel, como "Fazenda", precisamos apenas:
1.  Criar o record `FarmDetails` no domínio.
2.  Criar a entidade `FarmDetailsJpaEntity` na infraestrutura.
3.  Criar o DTO `CreateFarmRequest`.
4.  Implementar um `FarmDetailsMapper`.

Nenhuma alteração é necessária nos `Controllers` ou `CommandHandlers` principais. Dessa forma o sistema é aberto para extensão.

## Conclusão

O "Details Pattern" tem sido um sucesso retumbante no Keystone. Ele nos deu:
-   **Um Domínio Limpo:** Nossa lógica de negócio está isolada e não contaminada por preocupações de persistência.
-   **Flexibilidade Máxima:** Adicionar novos tipos é trivial e de baixo risco.
-   **Um Schema de Banco de Dados Normalizado:** Sem colunas nulas desnecessárias.

O trade-off é uma complexidade de mapeamento concentrada no `Repository`, mas essa é uma troca que fazemos com prazer pela clareza e escalabilidade que ganhamos em todo o resto do sistema. É uma demonstração poderosa de como a "Composição sobre Herança" pode levar a um design de software mais robusto e sustentável.

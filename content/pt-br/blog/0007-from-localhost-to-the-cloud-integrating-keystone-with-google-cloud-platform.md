---
title: "Do Localhost para a Nuvem: Integrando o Keystone com Google Cloud Platform"
description: "Uma análise prática de nossa estratégia de nuvem. Veja como utilizamos o Cloud SQL e o Google Cloud Storage para criar uma infraestrutura de backend robusta e escalável, e como o Spring Cloud GCP simplificou drasticamente essa integração."
date: 2025-07-27
image: https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 9
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/Vdeo_Animado_Pronto-ezgif.webp
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Desenvolver uma aplicação robusta localmente é apenas metade da batalha. Para que um sistema como o Keystone atenda seus usuários de forma confiável e escalável, ele precisa de uma infraestrutura de nuvem sólida. A escolha da plataforma e a estratégia de integração são decisões críticas que impactam a performance, o custo e a manutenibilidade do projeto.

Neste post, vamos detalhar nossa decisão de padronizar no **Google Cloud Platform (GCP)** e como integramos nossa aplicação Spring Boot com dois de seus serviços principais: **Cloud SQL** para nosso banco de dados e **Google Cloud Storage (GCS)** para armazenamento de arquivos.

## Fase 1: A Estratégia - Por Que Google Cloud? (ADR-0019)

A decisão de consolidar nossa infraestrutura no GCP foi estratégica. Em vez de misturar provedores, optamos por um ecossistema unificado para simplificar o gerenciamento, a segurança (IAM) e a integração entre os serviços.

Nossas duas necessidades de infraestrutura mais críticas eram:
1.  **Um banco de dados relacional gerenciado:** Precisávamos da robustez do PostgreSQL, mas sem o fardo de gerenciar servidores, backups, patches e replicação.
2.  **Um local para armazenar arquivos grandes:** As imagens de imóveis são um ativo central do Keystone e precisam ser armazenadas de forma segura, durável e com baixa latência de acesso.

A resposta para esses requisitos no GCP foi clara: **Cloud SQL for PostgreSQL** e **Google Cloud Storage (GCS)**.

## Fase 2: Persistência de Dados com Cloud SQL

Usar um serviço de banco de dados gerenciado como o Cloud SQL nos libera para focar no que realmente importa: a lógica de negócio da nossa aplicação.

A integração com nossa aplicação Spring Boot foi notavelmente simples, graças ao **Spring Cloud GCP**. Em nosso arquivo `build.gradle`, adicionamos a dependência:

```groovy
// build.gradle
implementation("com.google.cloud:spring-cloud-gcp-starter-sql-postgresql")
```

Este starter faz um trabalho pesado por nós. Em um ambiente de produção, ele permite que a aplicação se conecte à instância do Cloud SQL de forma segura usando as credenciais do Service Account do ambiente (via IAM), eliminando a necessidade de armazenar senhas de banco de dados em arquivos de configuração.

Nossa configuração de produção (`application-prod.properties`) se torna mais segura e declarativa, focando no nome da instância em vez de credenciais explícitas.

## Fase 3: Armazenamento de Mídia com Google Cloud Storage (GCS)

Para as imagens dos imóveis, o GCS foi a escolha ideal. Ele é um serviço de armazenamento de objetos projetado para alta durabilidade e performance global.

Seguindo os princípios da nossa arquitetura, a responsabilidade de interagir com o GCS foi encapsulada no nosso módulo `Files`, por trás de uma interface `IStorageService`. Isso garante que o resto da aplicação não precise saber onde ou como os arquivos são armazenados.

A implementação concreta, `GcsStorageService`, utiliza outro starter do Spring Cloud GCP:

```groovy
// build.gradle
implementation 'com.google.cloud:spring-cloud-gcp-starter-storage'
```

Este starter autoconfigura um bean `Storage` do SDK do Google Cloud, que podemos injetar diretamente em nosso service. O código para fazer o upload de uma imagem se torna incrivelmente limpo:

```java
// GcsStorageService.java (simplificado)
@Service
public class GcsStorageService implements IStorageService {

    // Injetado automaticamente pelo Spring Cloud GCP
    private final Storage storage;

    @Override
    public String uploadImage(UUID propertyId, MultipartFile imageFile) throws IOException {
        String blobName = generateUniqueBlobName(propertyId, imageFile);
        BlobId blobId = BlobId.of("your-bucket-name", blobName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                                    .setContentType(imageFile.getContentType())
                                    .build();
        
        // O SDK lida com toda a complexidade da API
        storage.create(blobInfo, imageFile.getBytes());

        return "https://storage.googleapis.com/your-bucket-name/" + blobName;
    }
}
```

Toda a complexidade de autenticação, retentativas e chamadas de API é abstraída pelo starter e pelo SDK.

## Conclusão

A combinação de uma estratégia de nuvem bem definida com as ferramentas de integração certas, como o Spring Cloud GCP, é um acelerador de produtividade imenso. Ao delegar a complexidade da infraestrutura de banco de dados e armazenamento de arquivos para serviços gerenciados do GCP, nossa equipe no Keystone pode se concentrar em entregar valor de negócio, com a confiança de que a fundação do nosso sistema é segura, escalável e confiável.

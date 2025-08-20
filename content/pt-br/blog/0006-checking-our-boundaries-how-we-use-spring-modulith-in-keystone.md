---
title: "Verificando Nossas Fronteiras: Como Usamos o Spring Modulith no Keystone"
description: "Boas cercas fazem bons vizinhos. Em um Monólito Modular, a disciplina é crucial. Descubra como usamos o Spring Modulith para testar, documentar e garantir que as fronteiras entre nossos módulos de negócio permaneçam intactas."
date: 2025-07-20
image: https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 9
author:
  name: Koda Turqui
  avatar:
    src: https://kktportfolio.blob.core.windows.net/public/portfolio/images/Vdeo_Animado_Pronto-ezgif.webp
    alt: Gif animado do Koda em pixelart
---

**Importante:** Ao longo do artigo será citado múltiplas vezes o termo `ADR`, que significa `Architecture Decision Records` (Registro de Decisões Arquiteturais). Você pode ler cada ADR do projeto [Aqui](https://github.com/koda-kaolinite/keystone_api/tree/main/docs/ARCHITECTURE-DESICION-LOG).

Um dos maiores riscos de uma arquitetura de Monólito Modular é a erosão de suas fronteiras internas. Em um único código-fonte, com a pressão do dia a dia, é tentador para um desenvolvedor criar um atalho e fazer um módulo acessar diretamente um componente interno de outro. O compilador não irá reclamar, mas cada atalho desses é uma rachadura na fundação da nossa arquitetura, introduzindo acoplamento e tornando a manutenção futura um pesadelo.

No projeto Keystone, não confiamos apenas na disciplina da equipe. Nós automatizamos a vigilância de nossas fronteiras usando uma ferramenta poderosa do ecossistema Spring: o **Spring Modulith**.

## O Desafio: Mantendo os Módulos Realmente Modulares

Nossa arquitetura, definida em múltiplos ADRs, decreta que módulos de negócio como `Property` e `Administration` são independentes e devem se comunicar apenas por meio de contratos públicos (como eventos ou DTOs).

No entanto, na prática, o que impede um `Service` do módulo de administração de injetar e usar diretamente um `Repository` do módulo de imóveis? Sem uma ferramenta específica, a resposta seria: "apenas o code review". E isso não é suficiente.

Precisávamos de uma forma de garantir programaticamente que as regras de encapsulamento entre os módulos fossem respeitadas.

## A Solução: Spring Modulith em Ação

O Spring Modulith é um projeto que suporta desenvolvedores na criação de aplicações Spring Boot bem-estruturadas e modulares. Ele não é um framework que impõe uma forma de trabalhar, mas sim uma coleção de ferramentas que observam sua aplicação e a ajudam a seguir os princípios que você mesmo definiu.

Em nosso `build.gradle`, garantimos que as dependências essenciais do Modulith estejam presentes:
```groovy
// build.gradle
implementation 'org.springframework.modulith:spring-modulith-starter-core'
testImplementation 'org.springframework.modulith:spring-modulith-starter-test'
```

Com isso, ganhamos duas capacidades cruciais: verificação em tempo de teste e documentação viva.

### 1. Verificação de Módulos com Testes

Esta é a funcionalidade mais poderosa para nós. O Spring Modulith nos permite escrever um teste de integração simples que verifica a saúde da nossa modularidade.

Por padrão, o Modulith considera cada subpacote direto do pacote principal da aplicação como um módulo. Em nosso caso, pacotes como `com.ts.keystone.api.property` e `com.ts.keystone.api.administration` são tratados como módulos distintos.

Criamos um teste de arquitetura que verifica se as dependências entre esses módulos estão de acordo com nossas regras:

```java
import com.ts.keystone.api.KeystoneApplication;
import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularityTest {

    // Carrega a definição dos módulos a partir da nossa classe principal
    ApplicationModules modules = ApplicationModules.of(KeystoneApplication.class);

    @Test
    void shouldRespectModuleBoundaries() {
        // O método verify() checa se há dependências ilegais
        // entre os módulos. Uma dependência é ilegal se uma classe
        // acessa um tipo de outro módulo que não é exportado
        // (ou seja, não está em um pacote publicamente definido).
        modules.verify();
    }
}
```

Este único teste, que roda em nosso pipeline de CI/CD, é nossa principal linha de defesa. Se um desenvolvedor criar uma dependência indevida, o teste `shouldRespectModuleBoundaries` falhará, quebrando a build. Isso transforma um potencial erro de arquitetura silencioso em um erro de compilação explícito e imediato.

### 2. Documentação Viva

O segundo grande benefício é a capacidade do Spring Modulith de gerar documentação a partir da estrutura real do código. Ele pode criar diagramas C4 ou PlantUML que mostram os módulos e suas interdependências.

Isso significa que nossos diagramas de arquitetura nunca ficam desatualizados. Eles são um reflexo fiel do estado atual do código, gerados como parte do processo de build. Isso alinha perfeitamente com nossa filosofia de "Arquitetura como Código".

## Conclusão

O Spring Modulith é uma ferramenta essencial em nosso cinto de utilidades no Keystone. Ele age como um guarda de fronteira automatizado, garantindo que a estrutura modular que planejamos com tanto cuidado nos ADRs seja a estrutura que de fato existe no código-fonte.

Ao nos fornecer testes de verificação e documentação viva, o Modulith nos dá a confiança para escalar e manter nosso Monólito Modular, sabendo que suas fundações estão protegidas contra a erosão natural que aflige tantos projetos de software de longa duração. Não estamos apenas esperando que nossa arquitetura permaneça limpa; estamos garantindo isso a cada build.

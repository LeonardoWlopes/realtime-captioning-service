# **Objetivo**

Criar um serviço backend básico que simula legendas em tempo real e rastreia o uso.

## **Requisitos**

Por favor, crie dois endpoints de API para os clientes do serviço:

- [ ] **Endpoint de Legendas**
  - [ ] Um WebSocket aceitando pacotes de áudio em tempo real e retornando periodicamente legendas.
  - [ ] O serviço deve simular o conteúdo das legendas retornando sequencialmente pedaços de texto 'lorem ipsum' gerados aleatoriamente a cada X milissegundos. Defina um atraso razoável que imite o comportamento de um serviço de transcrição real.
- [ ] **Endpoint de Uso**
  - [ ] Um recurso RESTful retornando o total de uso de legendas atual para um determinado cliente.
  - [ ] O uso deve ser medido em **milissegundos totais de tempo de legendagem com base nos pacotes de áudio recebidos**. Por exemplo, se um cliente enviar 50 pacotes (cada um representando 100ms), o total de uso deve refletir 5000ms.
- [ ] **Preferência de Stack Tecnológico**
  - [ ] Preferimos fortemente soluções que usem **Node.js e Express**.

### **Suposições Simplificadoras:**

- [ ] Suponha que os dados de áudio em tempo real são enviados pelos clientes via WebSocket em **pacotes sequenciais**, com cada novo pacote representando **100ms de conteúdo de fala**. Não é necessário examinar ou analisar dados de áudio reais.
- [ ] Um mecanismo de autenticação completo não é necessário. Você pode aceitar um token de sessão de qualquer tipo para identificar os clientes.
- [ ] Você pode usar **qualquer mecanismo de armazenamento** que achar apropriado para rastrear o uso. Isso pode envolver um banco de dados, mas um armazenamento em memória é suficiente.
- [ ] Trate este código como um **'sistema backend crítico'**.

---

## **Tarefa Bônus**

- [ ] Implemente um **limite de tempo de legendagem**, que **encerra a legendagem quando um usuário excede uma cota predefinida**.
- [ ] O limite de tempo de legendagem deve impor um **limite máximo de uso (por exemplo, 60 segundos por usuário)** e deve desconectar clientes ou rejeitar pacotes além desse limite. Os candidatos devem determinar a melhor forma de impor e comunicar esse limite.

---

## **Diretrizes de Submissão**

- [ ] Por favor, inclua um **breve README** explicando:
  - [ ] Suas escolhas de implementação
  - [ ] Como executar o serviço
  - [ ] Como testar os endpoints
- [ ] Grave um **vídeo de 5 minutos no Loom** demonstrando o serviço em ação para que possamos avaliar a funcionalidade sem precisar executar o código nós mesmos.
- [ ] Se possível, forneça um **script simples ou instruções** para demonstrar a funcionalidade do WebSocket.
- [ ] Por favor, envie sua avaliação concluída aqui: [Formulário de Submissão de Avaliação](https://www.notion.so/199ee9e2507c805882d1dfc88a776b82?pvs=21).

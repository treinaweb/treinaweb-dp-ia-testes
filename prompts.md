PROMPTS SUGERIDOS

Bloco 1: Conhecendo o projeto com o agente

Explique a arquitetura deste projeto e as regras de negócio que estão em src/precos.ts.
Diga também o que facilita (ou dificulta) testar esse código.
Ainda não altere nada.
Bloco 2: Testes unitários com IA
Crie testes unitários com Vitest para src/precos.ts em tests/precos.test.ts.

Cubra:
- caminho feliz (subtotal, desconto do cupom, total)
- casos de borda: o limite exato do frete grátis e o cupom no último dia de validade
- erros: pedido vazio, quantidade zero ou negativa, cupom expirado

Regras:
- use datas fixas passando o parâmetro "hoje"; nunca dependa da data atual
- os valores esperados devem vir da REGRA DE NEGÓCIO do README, não do código
- não altere o código de produção
Depois rode npm test.

Adicione testes para os dois lados da fronteira do frete (99.99 e 100.01)
e agrupe os testes com describe por regra: subtotal, cupom, frete e validações.
Bloco 3: Testes de integração com IA
Crie testes de integração em tests/pedidos.test.ts usando Supertest.

- Em cada teste, crie um banco novo com criarBanco() e o app com criarApp(db)
- Cubra:
  GET /produtos (lista os produtos iniciais)
  POST /pedidos: sucesso (201 + total correto), produto inexistente (404),
    estoque insuficiente (400), cupom inexistente (404), itens vazios (400)
  GET /pedidos/:id: pedido existente e inexistente
- Depois de um pedido com sucesso, confira se o estoque do produto foi baixado
- Não altere o código de produção. Rode npm test no final.

Bloco 4: Investigação de causa raiz

4.1 Chamado #101
Chamado #101 do CHAMADOS.md: cliente comprou exatamente R$ 100 e pagou frete.
Já existe um teste falhando em tests/precos.test.ts que reproduz isso.
Explique a causa raiz e depois faça a correção mínima. Rode todos os testes.
4.2 Chamado #102 (plan mode)
Chamado #102 do CHAMADOS.md: a Caneca ficou com estoque -1. Tínhamos 3 unidades
e o pedido tinha a caneca adicionada duas vezes no carrinho.

Investigue a causa raiz. Quero:
1. um teste de integração que reproduza o problema
2. a explicação da causa, apontando a linha exata e por que os testes atuais não pegaram
3. uma proposta de correção mínima
Não corrija ainda.

Ótimo. Crie o teste em tests/pedidos.test.ts, confirme que ele falha,
aplique a correção mínima e rode toda a suíte.

Bloco 5: TDD com IA

5.1 Convenções no CLAUDE.md

Analise os testes em tests/ e crie um CLAUDE.md com uma seção "Testes"
contendo as convenções deste projeto. Inclua:
- onde ficam os testes unitários e os de integração
- nomes de teste em português, descrevendo a regra de negócio
- valores esperados vêm da regra de negócio, nunca do código
- datas sempre fixas (parâmetro "hoje"); nunca a data atual
- banco novo em memória por teste de integração
- testar comportamento (entrada e saída), não detalhes internos
- usar helpers para montar dados repetidos
Seja curto: no máximo 15 linhas.

5.2 Vermelho

Vamos implementar o FEATURE.md com TDD. Nesta etapa, escreva APENAS os testes:
- unitários em tests/precos.test.ts, para cada critério de aceite
- integração em tests/pedidos.test.ts: pedido com VALE15 abaixo do mínimo (400 +
  mensagem) e com exatamente R$ 150 (201)
NÃO implemente nada em src/. Rode os testes e confirme que os novos falham
pelo motivo certo (comportamento ausente, não erro de digitação).

5.3 Verde

Agora implemente o mínimo necessário em src/ para os testes passarem.
Não altere nenhum teste. Rode a suíte inteira.
# CLAUDE.md

API de loja em Express + TypeScript, testada com Vitest (`npm test`).

## Testes

- Unitários: `tests/precos.test.ts` (funções puras de `src/precos.ts`). Integração: `tests/pedidos.test.ts` (rotas HTTP via supertest).
- Nomes de teste em português, descrevendo a regra de negócio (ex.: "frete é grátis com subtotal exatamente R$ 100").
- Valores esperados vêm da regra de negócio, nunca do código: calcule à mão, não copie o que a função retorna.
- Datas sempre fixas, passadas no parâmetro `hoje` (ex.: `const HOJE = new Date(2026, 9, 30)`); nunca use a data atual.
- Integração: banco novo em memória por teste (`criarApp(criarBanco())`), sem estado compartilhado.
- Teste comportamento (entrada e saída, status e corpo da resposta), não detalhes internos.
- Use helpers para montar dados repetidos (ex.: `cupom()`, `novoApp()`, `PRODUTOS_INICIAIS`).
- Agrupe com `describe` por cenário: sucesso/caminho feliz, casos de borda, erros.
- Sempre siga a metodologia TDD - Execute os testes (falharem) e depois implemente a feature de acordo com as
solicitações do desenvolvedor.

# Lojinha API

Mini API de loja usada no Direto ao Ponto **Testes e correção de bugs com IA**.

Stack: Node 24 · TypeScript · Express · SQLite (`node:sqlite`, SQL puro) · Vitest · Supertest

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # roda os testes (ainda não há nenhum!)
```

## Estrutura

| Arquivo          | O que faz                                                    |
| ---------------- | ------------------------------------------------------------ |
| `src/precos.ts`  | Regras de preço: subtotal, cupom de desconto e frete         |
| `src/db.ts`      | Cria o banco (`:memory:` por padrão), as tabelas e os dados  |
| `src/app.ts`     | Rotas da API (recebe o banco por parâmetro)                  |
| `src/server.ts`  | Sobe o servidor usando o arquivo `loja.db`                   |
| `CHAMADOS.md`    | Chamados de clientes (bugs a investigar)                     |
| `FEATURE.md`     | Próxima funcionalidade, com critérios de aceite              |

## Regras de negócio

- Frete de **R$ 15**, grátis para compras **a partir de R$ 100**.
- Cupom aplica um desconto percentual sobre o subtotal, se estiver dentro da validade.
- Não é possível comprar mais do que há em estoque.

## Endpoints

```http
GET  /produtos
POST /pedidos        { "itens": [{ "produtoId": 1, "quantidade": 2 }], "cupom": "BEMVINDO10" }
GET  /pedidos/:id
```

Cupons cadastrados: `BEMVINDO10` (10%, sem data de vencimento próxima) e `BLACK20` (20%, já vencido).

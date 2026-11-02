import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { criarApp } from '../src/app';
import { criarBanco } from '../src/db';

// Banco em memória novo a cada teste
const novoApp = () => criarApp(criarBanco());

const PRODUTOS_INICIAIS = [
  { id: 1, nome: 'Camiseta TreinaWeb', preco: 50, estoque: 10 },
  { id: 2, nome: 'Caneca', preco: 25, estoque: 3 },
  { id: 3, nome: 'Boné', preco: 40, estoque: 5 },
  { id: 4, nome: 'Adesivo', preco: 5, estoque: 100 },
];

describe('GET /produtos', () => {
  it('lista os produtos iniciais', async () => {
    const res = await request(novoApp()).get('/produtos');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(PRODUTOS_INICIAIS);
  });
});

describe('POST /pedidos', () => {
  describe('sucesso', () => {
    it('cria o pedido e cobra frete abaixo de R$ 100', async () => {
      const res = await request(novoApp())
        .post('/pedidos')
        .send({ itens: [{ produtoId: 2, quantidade: 2 }] });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        subtotal: 50,
        desconto: 0,
        frete: 15,
        total: 65,
      });
    });

    it('aplica o cupom válido', async () => {
      const res = await request(novoApp())
        .post('/pedidos')
        .send({ itens: [{ produtoId: 1, quantidade: 2 }], cupom: 'BEMVINDO10' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        subtotal: 100,
        desconto: 10,
        frete: 0,
        total: 90,
      });
    });

    it('baixa o estoque do produto', async () => {
      const app = novoApp();

      await request(app)
        .post('/pedidos')
        .send({ itens: [{ produtoId: 1, quantidade: 2 }] })
        .expect(201);

      const res = await request(app).get('/produtos');

      expect(res.body).toEqual([
        { ...PRODUTOS_INICIAIS[0], estoque: 8 },
        ...PRODUTOS_INICIAIS.slice(1),
      ]);
    });

    it('aceita o VALE15 com subtotal exatamente R$ 150', async () => {
      const res = await request(novoApp())
        .post('/pedidos')
        .send({ itens: [{ produtoId: 1, quantidade: 3 }], cupom: 'VALE15' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        subtotal: 150,
        desconto: 22.5,
        frete: 0,
        total: 127.5,
      });
    });
  });

  describe('erros', () => {
    it('retorna 400 quando o subtotal fica abaixo do mínimo do VALE15', async () => {
      const res = await request(novoApp())
        .post('/pedidos')
        .send({
          itens: [
            { produtoId: 1, quantidade: 2 },
            { produtoId: 3, quantidade: 1 },
          ],
          cupom: 'VALE15',
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'Pedido mínimo de R$ 150,00 para este cupom' });
    });

    it('retorna 404 para produto inexistente', async () => {
      const res = await request(novoApp())
        .post('/pedidos')
        .send({ itens: [{ produtoId: 999, quantidade: 1 }] });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: 'Produto 999 não encontrado' });
    });

    it('retorna 400 para estoque insuficiente e não baixa o estoque', async () => {
      const app = novoApp();

      const res = await request(app)
        .post('/pedidos')
        .send({ itens: [{ produtoId: 2, quantidade: 4 }] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'Estoque insuficiente para Caneca' });

      const produtos = await request(app).get('/produtos');
      expect(produtos.body).toEqual(PRODUTOS_INICIAIS);
    });

    // Chamado #102: mesmo produto repetido no carrinho deixava o estoque negativo
    it('retorna 400 quando o mesmo produto aparece repetido e a soma excede o estoque', async () => {
      const app = novoApp();

      const res = await request(app)
        .post('/pedidos')
        .send({
          itens: [
            { produtoId: 2, quantidade: 2 },
            { produtoId: 2, quantidade: 2 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'Estoque insuficiente para Caneca' });

      const produtos = await request(app).get('/produtos');
      expect(produtos.body).toEqual(PRODUTOS_INICIAIS);
    });

    it('retorna 404 para cupom inexistente', async () => {
      const res = await request(novoApp())
        .post('/pedidos')
        .send({ itens: [{ produtoId: 1, quantidade: 1 }], cupom: 'NAOEXISTE' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: 'Cupom não encontrado' });
    });

    it('retorna 400 para itens vazios', async () => {
      const res = await request(novoApp()).post('/pedidos').send({ itens: [] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'Informe os itens do pedido' });
    });
  });
});

describe('GET /pedidos/:id', () => {
  it('retorna o pedido existente', async () => {
    const app = novoApp();

    const criado = await request(app)
      .post('/pedidos')
      .send({ itens: [{ produtoId: 2, quantidade: 2 }] })
      .expect(201);

    const res = await request(app).get(`/pedidos/${criado.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: criado.body.id,
      subtotal: 50,
      desconto: 0,
      frete: 15,
      total: 65,
      criado_em: expect.any(String),
    });
  });

  it('retorna 404 para pedido inexistente', async () => {
    const res = await request(novoApp()).get('/pedidos/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Pedido não encontrado' });
  });
});

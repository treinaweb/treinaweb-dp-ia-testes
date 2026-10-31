import express from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { calcularTotal, type Cupom } from './precos';

type Produto = { id: number; nome: string; preco: number; estoque: number };
type ItemPedido = { produtoId: number; quantidade: number };

export function criarApp(db: DatabaseSync) {
  const app = express();
  app.use(express.json());

  app.get('/produtos', (_req, res) => {
    res.json(db.prepare('SELECT * FROM produtos').all());
  });

  app.post('/pedidos', (req, res) => {
    const { itens, cupom: codigoCupom } = req.body as { itens?: ItemPedido[]; cupom?: string };

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Informe os itens do pedido' });
    }

    const buscarProduto = db.prepare('SELECT * FROM produtos WHERE id = ?');
    const itensCalculo = [];

    for (const item of itens) {
      const produto = buscarProduto.get(item.produtoId) as Produto | undefined;
      if (!produto) {
        return res.status(404).json({ erro: `Produto ${item.produtoId} não encontrado` });
      }
      if (produto.estoque < item.quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}` });
      }
      itensCalculo.push({ preco: produto.preco, quantidade: item.quantidade });
    }

    let cupom: Cupom | undefined;
    if (codigoCupom) {
      cupom = db.prepare('SELECT * FROM cupons WHERE codigo = ?').get(codigoCupom) as Cupom | undefined;
      if (!cupom) {
        return res.status(404).json({ erro: 'Cupom não encontrado' });
      }
    }

    let resumo;
    try {
      resumo = calcularTotal(itensCalculo, cupom);
    } catch (erro) {
      return res.status(400).json({ erro: (erro as Error).message });
    }

    const baixarEstoque = db.prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ?');
    for (const item of itens) {
      baixarEstoque.run(item.quantidade, item.produtoId);
    }

    const { lastInsertRowid } = db
      .prepare('INSERT INTO pedidos (subtotal, desconto, frete, total) VALUES (?, ?, ?, ?)')
      .run(resumo.subtotal, resumo.desconto, resumo.frete, resumo.total);

    res.status(201).json({ id: Number(lastInsertRowid), ...resumo });
  });

  app.get('/pedidos/:id', (req, res) => {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }
    res.json(pedido);
  });

  return app;
}

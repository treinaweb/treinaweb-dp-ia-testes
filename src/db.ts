import { DatabaseSync } from 'node:sqlite';

export function criarBanco(caminho = ':memory:'): DatabaseSync {
  const db = new DatabaseSync(caminho);

  db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nome    TEXT    NOT NULL,
      preco   REAL    NOT NULL,
      estoque INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cupons (
      codigo     TEXT PRIMARY KEY,
      percentual REAL NOT NULL,
      validade   TEXT NOT NULL -- AAAA-MM-DD
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      subtotal  REAL NOT NULL,
      desconto  REAL NOT NULL,
      frete     REAL NOT NULL,
      total     REAL NOT NULL,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const { qtd } = db.prepare('SELECT COUNT(*) AS qtd FROM produtos').get() as { qtd: number };
  if (qtd === 0) popular(db);

  return db;
}

function popular(db: DatabaseSync) {
  const produto = db.prepare('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)');
  produto.run('Camiseta TreinaWeb', 50, 10);
  produto.run('Caneca', 25, 3);
  produto.run('Boné', 40, 5);
  produto.run('Adesivo', 5, 100);

  const cupom = db.prepare('INSERT INTO cupons (codigo, percentual, validade) VALUES (?, ?, ?)');
  cupom.run('BEMVINDO10', 10, '2099-12-31');
  cupom.run('BLACK20', 20, '2024-11-30');
}

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
      validade   TEXT NOT NULL, -- AAAA-MM-DD
      minimo     REAL          -- subtotal mínimo; NULL = sem mínimo
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

  migrar(db);

  const { qtd } = db.prepare('SELECT COUNT(*) AS qtd FROM produtos').get() as { qtd: number };
  if (qtd === 0) popular(db);

  // Fora do popular() para também chegar em bancos já existentes
  db.prepare(
    'INSERT OR IGNORE INTO cupons (codigo, percentual, validade, minimo) VALUES (?, ?, ?, ?)',
  ).run('VALE15', 15, '2099-12-31', 150);

  return db;
}

// Bancos criados antes do cupom com pedido mínimo não têm a coluna "minimo"
function migrar(db: DatabaseSync) {
  const colunas = db.prepare('PRAGMA table_info(cupons)').all() as { name: string }[];
  if (!colunas.some((coluna) => coluna.name === 'minimo')) {
    db.exec('ALTER TABLE cupons ADD COLUMN minimo REAL');
  }
}

function popular(db: DatabaseSync) {
  const produto = db.prepare('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)');
  produto.run('Camiseta TreinaWeb', 50, 10);
  produto.run('Caneca', 25, 3);
  produto.run('Boné', 40, 5);
  produto.run('Adesivo', 5, 100);

  const cupom = db.prepare(
    'INSERT INTO cupons (codigo, percentual, validade, minimo) VALUES (?, ?, ?, ?)',
  );
  cupom.run('BEMVINDO10', 10, '2099-12-31', null);
  cupom.run('BLACK20', 20, '2024-11-30', null);
}

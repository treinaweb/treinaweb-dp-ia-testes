import { criarApp } from './app';
import { criarBanco } from './db';

const PORTA = Number(process.env.PORT ?? 3000);

criarApp(criarBanco('loja.db')).listen(PORTA, () => {
  console.log(`Lojinha rodando em http://localhost:${PORTA}`);
});

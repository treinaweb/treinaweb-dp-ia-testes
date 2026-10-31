# Nova funcionalidade: cupom com pedido mínimo

> **Como** loja, **quero** cupons que só valem a partir de um valor mínimo de compra,
> **para** incentivar pedidos maiores.

## Critérios de aceite

1. Um cupom pode ter um **valor mínimo** de pedido. Cupons sem mínimo continuam funcionando como hoje.
2. O mínimo é comparado com o **subtotal** (antes do desconto e do frete).
3. Se o subtotal for menor que o mínimo, o pedido é recusado com status **400** e a mensagem:
   `Pedido mínimo de R$ 150,00 para este cupom`
4. Subtotal **exatamente igual** ao mínimo é aceito.
5. Cadastrar o novo cupom **`VALE15`**: 15% de desconto, pedido mínimo de R$ 150, sem vencimento próximo.

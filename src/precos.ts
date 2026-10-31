export type ItemCalculo = { preco: number; quantidade: number };
export type Cupom = { codigo: string; percentual: number; validade: string };

export type Resumo = {
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
};

export const VALOR_FRETE = 15;
export const FRETE_GRATIS_A_PARTIR_DE = 100;

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

// Datas no formato AAAA-MM-DD
export function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function cupomValido(cupom: Cupom, hoje: Date = new Date()): boolean {
  return cupom.validade >= formatarData(hoje);
}

export function calcularTotal(
  itens: ItemCalculo[],
  cupom?: Cupom,
  hoje: Date = new Date(),
): Resumo {
  if (itens.length === 0) {
    throw new Error('O pedido precisa ter ao menos um item');
  }

  for (const item of itens) {
    if (item.quantidade <= 0) {
      throw new Error('Quantidade inválida');
    }
  }

  const subtotal = arredondar(
    itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0),
  );

  let desconto = 0;
  if (cupom) {
    if (!cupomValido(cupom, hoje)) {
      throw new Error('Cupom expirado');
    }
    desconto = arredondar(subtotal * (cupom.percentual / 100));
  }

  const frete = subtotal > FRETE_GRATIS_A_PARTIR_DE ? 0 : VALOR_FRETE;
  const total = arredondar(subtotal - desconto + frete);

  return { subtotal, desconto, frete, total };
}

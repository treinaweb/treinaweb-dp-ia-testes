import { describe, expect, it } from 'vitest';
import { calcularTotal, type Cupom } from '../src/precos';

// Construtor local (não string ISO) para não sofrer com fuso horário
const HOJE = new Date(2026, 9, 30); // 30/10/2026

const cupom = (percentual: number, validade: string, minimo?: number): Cupom => ({
  codigo: 'TESTE',
  percentual,
  validade,
  ...(minimo !== undefined && { minimo }),
});

const MENSAGEM_MINIMO_150 = 'Pedido mínimo de R$ 150,00 para este cupom';

describe('calcularTotal', () => {
  describe('caminho feliz', () => {
    it('soma o subtotal e cobra frete abaixo de R$ 100', () => {
      const resumo = calcularTotal(
        [
          { preco: 20, quantidade: 2 },
          { preco: 10, quantidade: 1 },
        ],
        undefined,
        HOJE,
      );

      expect(resumo).toEqual({ subtotal: 50, desconto: 0, frete: 15, total: 65 });
    });

    it('aplica o desconto percentual do cupom sobre o subtotal', () => {
      const resumo = calcularTotal(
        [{ preco: 60, quantidade: 2 }],
        cupom(10, '2026-12-31'),
        HOJE,
      );

      expect(resumo).toEqual({ subtotal: 120, desconto: 12, frete: 0, total: 108 });
    });
  });

  describe('casos de borda', () => {
    it('frete é grátis com subtotal exatamente R$ 100 ("a partir de R$ 100")', () => {
      const resumo = calcularTotal([{ preco: 100, quantidade: 1 }], undefined, HOJE);

      expect(resumo.frete).toBe(0);
      expect(resumo.total).toBe(100);
    });

    it('cobra frete com subtotal logo abaixo de R$ 100', () => {
      const resumo = calcularTotal([{ preco: 99.99, quantidade: 1 }], undefined, HOJE);

      expect(resumo.frete).toBe(15);
      expect(resumo.total).toBe(114.99);
    });

    it('aceita o cupom no último dia de validade', () => {
      const resumo = calcularTotal(
        [{ preco: 50, quantidade: 1 }],
        cupom(10, '2026-10-30'),
        HOJE,
      );

      expect(resumo).toEqual({ subtotal: 50, desconto: 5, frete: 15, total: 60 });
    });
  });

  describe('erros', () => {
    it('rejeita pedido vazio', () => {
      expect(() => calcularTotal([], undefined, HOJE)).toThrow(
        'O pedido precisa ter ao menos um item',
      );
    });

    it('rejeita quantidade zero', () => {
      expect(() => calcularTotal([{ preco: 10, quantidade: 0 }], undefined, HOJE)).toThrow(
        'Quantidade inválida',
      );
    });

    it('rejeita quantidade negativa', () => {
      expect(() => calcularTotal([{ preco: 10, quantidade: -1 }], undefined, HOJE)).toThrow(
        'Quantidade inválida',
      );
    });

    it('rejeita cupom expirado', () => {
      expect(() =>
        calcularTotal([{ preco: 50, quantidade: 1 }], cupom(10, '2026-10-29'), HOJE),
      ).toThrow('Cupom expirado');
    });
  });

  describe('cupom com pedido mínimo', () => {
    it('cupom sem mínimo continua valendo para qualquer subtotal', () => {
      const resumo = calcularTotal([{ preco: 30, quantidade: 1 }], cupom(10, '2026-12-31'), HOJE);

      expect(resumo).toEqual({ subtotal: 30, desconto: 3, frete: 15, total: 42 });
    });

    it('mínimo é comparado com o subtotal, sem somar o frete', () => {
      // subtotal 140 + frete 15 = 155, mas o que conta é o subtotal (140)
      expect(() =>
        calcularTotal([{ preco: 140, quantidade: 1 }], cupom(15, '2026-12-31', 150), HOJE),
      ).toThrow(MENSAGEM_MINIMO_150);
    });

    it('mínimo é comparado com o subtotal, antes do desconto', () => {
      // total com desconto fica 127,50, abaixo do mínimo, mas o subtotal (150) atinge
      const resumo = calcularTotal(
        [{ preco: 150, quantidade: 1 }],
        cupom(15, '2026-12-31', 150),
        HOJE,
      );

      expect(resumo).toEqual({ subtotal: 150, desconto: 22.5, frete: 0, total: 127.5 });
    });

    it('recusa o pedido com subtotal logo abaixo do mínimo', () => {
      expect(() =>
        calcularTotal([{ preco: 149.99, quantidade: 1 }], cupom(15, '2026-12-31', 150), HOJE),
      ).toThrow(MENSAGEM_MINIMO_150);
    });

    it('aceita o pedido com subtotal exatamente igual ao mínimo', () => {
      const resumo = calcularTotal(
        [{ preco: 50, quantidade: 3 }],
        cupom(15, '2026-12-31', 150),
        HOJE,
      );

      expect(resumo).toEqual({ subtotal: 150, desconto: 22.5, frete: 0, total: 127.5 });
    });
  });
});

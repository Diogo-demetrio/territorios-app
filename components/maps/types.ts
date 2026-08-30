export type CoordenadaLimite = [number, number];

export type LimiteCongregacao = {
  id: number;
  nome: string;
  numero: string | null;
  idioma: string;
  cor: string;
  atualizado_origem_em: string | null;
  coordenadas: CoordenadaLimite[];
};

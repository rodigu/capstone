export class Edge {
  private vertice_b: number | string;
  private vertice_a: number | string;
  weight: number;

  constructor (args: { vertice_a: number | string, vertice_b: number | string, weight?: number }) {
    this.vertice_a = args.vertice_a;
    this.vertice_b = args.vertice_b;
    this.weight ??= 1;
  }

  get vertices () : { a: number | string, b: number | string } {
    return { a: this.vertice_a, b: this.vertice_b };
  }
}

/** Edge class */

export class Edge {
  nodeA:string|number;
  nodeB:string|number;
  weight:number;

  constructor(nodeA:string|number, nodeB:string|number, weight:number = 1) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.weight = weight;
  }

  get nodes() {
    return { A: this.nodeA, B: this.nodeB };
  }
}

/** Edge class */

export class Edge {
  /**
   * Edge class. Note that, to acces nodes, the `nodes` getter is used
   *
   * @param  {string|number} nodeA    id for nodeA
   * @param  {string|number} nodeB    id for nodeB
   * @param  {number} [weight=1]      edge's weight
   *
   * @property {string|number} _nodeA        id for nodeA of the Edge
   * @property {string|number} _nodeB        id for nodeB of the Edge
   */
  constructor(nodeA, nodeB, weight = 1) {
    this._nodeA = nodeA;
    this._nodeB = nodeB;
    this.weight = weight;
  }

  /**
   * get IDs for node A and node B
   *
   * @return {Object<string, string>}  IDs for edge's nodes
   */
  get nodes() {
    return { A: this._nodeA, B: this._nodeB };
  }
}

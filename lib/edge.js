/** Edge class */

export class Edge {
  /**
   * Edge class
   *
   * @param  {string|number} nodeA    id for nodeA
   * @param  {string|number} nodeB    id for nodeB
   * @param  {number} [weight=1]      edge's weight
   */
  constructor ({ nodeA, nodeB, weight = 1 }) {
    this.nodeA = nodeA
    this.nodeB = nodeB
    this.weight = weight
  }

  /**
   * get IDs for node A and node B
   *
   * @return {Object.<string, string>}  IDs for edge's nodes
   */
  get nodes () {
    return { A: this._nodeA, B: this._nodeB }
  }
}

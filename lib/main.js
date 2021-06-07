/** Network class */
export class Network {
  /**
   * Network class
   *
   * @param  {boolean} [isDirected=false]   if true, edge is directed A -> B
   */
  constructor ({ isDirected = false, limit = 500 }) {
    this._edges = new Map()
    this._nodes = new Map()
    this.isDirected = isDirected
    this._limit = 500
  }

  get edges () {
    return this._edges
  }

  get nodes () {
    return this._nodes
  }

  /**
   * addEdge - description
   *
   * @param  {string}  [id]             Edge's unique ID. If not given, an automatic ID will be generated
   * @param  {string}  nodeA            NodeA's ID
   * @param  {string}  nodeB            NodeB's ID
   * @param  {number}  [weight=1]       description
   * @param  {boolean} [doForce=true]   description
   *
   * @throws When trying to add existing edge
   * @throws When trying to add edge over allowed limit
   */
  addEdge ({ id, nodeA, nodeB, weight = 1, doForce = true }) {
    if (this._edges.has(id)) {
      throw new Error('Trying to add already existing edge')
    }
    if (this._edges.size >= this.limit) {
      throw new Error('Can\'t add new edge. Limit exceeded')
    }

    if (id === undefined) {
      do {
        id = id || Math.floor(Math.random(500))
      } while (this._edges.has(id))
    }
  }
}

/** Edge class */
export class Edge {
  /**
   * Edge class
   *
   * @param  {string} nodeA                 id for nodeA
   * @param  {string} nodeB                 id for nodeB
   * @param  {number} [weight=1]            edge's weight
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

/** Node class */
export class Node {
  /**
   * Node class
   *
   * @param  {number} [weight=1]  node's weight
   * @param  {string} id          node's id
   */
  constructor (id, weight = 1) {
    this.id = id
    this.weight = weight
  }
}

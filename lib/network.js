import { Node } from "./node.js";
import { Edge } from "./edge.js";

/** Network class */

export class Network {
  /**
   * Network class constructor
   *
   * @param    {boolean}  [is_directed=false]   if true, edges are directed A -> B
   * @param    {number}   [edge_limit=500]      limit for number of edges in the network
   * @param    {number}   [node_limit=500]      limit for number of nodes in the network
   *
   * @property  {Map<string|number, Node>}  nodes       Map with Network's nodes
   * @property  {Map<string|number, Edge>}  edges       Map with Network's edges
   * @property  {boolean} is_directed    If true, edges are directed A -> B
   * @property  {number}  _edge_limit    Limit for number of edges in the network
   * @property  {number}  _node_limit    Limit for number of nodes in the network
   * @property  {number}  _freeNID      Last known free Node ID, used when creating unassigned IDs, and when an Node is deleted
   * @property  {number}  _freeEID      Last known free Edge ID, used when creating unassigned IDs, and when an Edge is deleted
   * @property  {boolean} is_multigraph True if network is a multigraph (more than one edge between two nodes)
   */
  constructor(is_directed = false, is_multigraph = false, edge_limit = 500, node_limit = 500) {
    this._edges = new Map();
    this._nodes = new Map();
    this.is_directed = is_directed;
    this._edge_limit = edge_limit;
    this._node_limit = node_limit;
    this._freeEID = 0;
    this._freeNID = 0;
    this._is_multigraph = is_multigraph;
  }

  get edges() {
    return this._edges;
  }

  get nodes() {
    return this._nodes;
  }

  get is_multigraph() {
    return this._is_multigraph;
  }

  /**
   * Adds a new edge to the newtwork
   *
   * @param  {string|number}  nodeA     NodeA's ID
   * @param  {string|number}  nodeB     NodeB's ID
   * @param  {boolean} [doForce=false]  If true, if either any of the nodes does not exist
   * @param  {number}  [weight=1]       Edge's weight
   * @param  {string|number}  [id]      Edge's unique ID. If not given, an automatic ID will be generated
   *
   * @example <caption>Creating a network, and adding 2 nodes and an edge between them</caption>
   * import { Network } from './network.js'
   * const net = new Network();
   * // Adding nodes
   * net.addNode('A');
   * net.addNode('B');
   * // Adding edge
   * net.addEdge('A', 'B')
   *
   * @throws Error when trying to add existing edge
   * @throws Error when trying to add edge over allowed limit
   * @throws Error when trying to add edge on inexistent node (if not forcing edge)
   */
  addEdge(nodeA, nodeB, weight = 1, doForce = false, id = this._newEID()) {
    try {
      if (this._edges.has(id)) throw { message: Network.ERROR.EXISTING_EDGE };

      if (this._edges.size >= this._edge_limit)
        throw { message: Network.ERROR.EDGE_LIMIT };

      if (!doForce) {
        if (!this._nodes.has(nodeA))
          throw { message: Network.ERROR.INEXISTENT_NODE, node: nodeA };
        if (!this._nodes.has(nodeB))
          throw { message: Network.ERROR.INEXISTENT_NODE, node: nodeB };
      } else {
        if (!this._nodes.has(nodeA)) this.addNode({ id: nodeA });
        if (!this._nodes.has(nodeB)) this.addNode({ id: nodeB });
      }

      if (!this.is_multigraph && this.hasEdge(nodeA, nodeB))
        throw { message: Network.ERROR.NOT_MULTIGRAPH };

    } catch (e) {
      this._showError(e);
      return;
    }

    id = id ?? this._newEID();

    this._edges.set(id, new Edge(nodeA, nodeB, weight));
  }

  /**
   * Adds a new node to the newtwork
   *
   * @param  {number|string} id   New node's ID
   * @param  {number} [weight=1]  Node's weight
   *
   * @throws Error when trying to add node over the limit
   * @throws Error when trying to add existing node
   */
  addNode(id, weight = 1) {
    try {
      if (this._nodes.size >= this._node_limit)
        throw { message: Network.ERROR.NODE_LIMIT };
      if (this._nodes.has(id))
        throw { message: Network.ERROR.EXISTING_NODE };
    } catch (e) {
      this._showError(e);
    }

    id = id ?? this._newNID();

    this._nodes.set(id, new Node(id, weight));
  }

  /**
   * Removes node with specified ID
   *
   * @param  {string|number}  id  ID for node to be deleted
   */
  removeNode(id) {
    try {
      if (!this._nodes.has(id))
        throw { message: Network.ERROR.INEXISTENT_NODE, node: id };
    } catch (e) {
      this._showError(e);
    }

    this._nodes.delete(id);
  }

  /**
   * Removes Edge with specified nodes
   *
   * @param  {string|number} nodeA       Node A's ID
   * @param  {string|number} nodeB       Node B's ID
   * @param  {string|number} [id]        Edge's ID, only necessary if the graph is a multigraph
   */
  removeEdge(nodeA, nodeB, id) {
    if (this.is_multigraph) {
      this._removeMultigraphEdge(id);
      return;
    }
    for ([edgeID, edge] of this._edges.entries()) {
      const { A, B } = edge.nodes;
      if ((A === nodeA && B === nodeB) || (B === nodeA && A === nodeB)) {
        this._edges.delete(edgeID);
        break;
      }
    }
  }

  /**
   * Returns a list with the IDs of all edges between nodeA and nodeB. If the network is not a multigraph, only one ID will be returned
   *
   * @param  {string|number} nodeA       Node A's ID
   * @param  {string|number} nodeB       Node B's ID
   *
   * @return {Array<string>}  IDs for edges between A and B
   */
  getEdgesBetween (nodeA, nodeB) {
    let edge_list = [];
    for ([edgeID, edge] of this._edges.entries()) {
      const { A, B } = edge.nodes;
      if ((A === nodeA && B === nodeB) || (B === nodeA && A === nodeB)) {
        edge_list.push(edgeID);
      }
    }
    return edge_list;
  }


  /**
   * Returns true if there exists an edge between A and B
   *
   * @param {string|number} nodeA      Node A's ID
   * @param {string|number} nodeB      Node B's ID
   *
   * @return {boolean} Whether there exists an edge between A and B
   */
  hasEdge (nodeA, nodeB) {
    let has_edge = false;
    this.edges.forEach(({ nodes }, id) => {
      const { A, B } = nodes;
      if ((A === nodeA && B === nodeB)){
        if (this.is_directed || (B === nodeA && A === nodeB)) {
          has_edge = true;
          return;
        }
      }
    });
    return has_edge;
  }

  /**
   * Removes multigraph edge
   * @private
   */
  _removeMultigraphEdge (id) {
    this.edges.delete(id);
  }

  /**
   * Generates new Edge ID
   * @private
   * @return {number}  Edge ID
   */
  _newEID() {
    const id = this._freeEID++;
    while (this._edges.has(id)) {
      id = Math.floor(Math.random(this._edge_limit));
    }
    return id;
  }

  /**
   * Generates new Node ID
   * @private
   * @return {number}  Node ID
   */
  _newNID() {
    const id = this._freeNID++;
    while (this._node.has(id)) {
      id = Math.floor(Math.random(this._node_limit));
    }
    return id;
  }

  /**
   * Logs caught errors
   * @private
   */
  _showError (error) {
    console.log(`${error.message}${(error.node === undefined ? '' : ' : ' + error.node)}`);
  }
}

Network.ERROR = {
  UNDEFINED_VALUES: "Undefined values being given as arguments!",
  EDGE_LIMIT: "Can't add new edge. Limit of Edges exceeded",
  NODE_LIMIT: "Can't add new node. Limit of Nodes exceeded",
  EXISTING_EDGE: "Trying to add an edge with already existing ID",
  EXISTING_NODE: "Trying to add a node with already existing ID",
  INEXISTENT_NODE: "Node doesn't exist",
  NOT_MULTIGRAPH: "Trying to add multiple edges between two nodes. Graph is not a multigraph!",
};

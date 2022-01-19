import { Vertice } from "./vertice.ts";
import { Edge } from "./edge.ts";
import { base_id, VerticeArgs, EdgeArgs, NetworkArgs, ERROR } from './enums.ts'

export class Network {
  readonly edges:Map<base_id, Edge>;
  readonly vertices:Map<base_id, Vertice>;

  readonly is_directed:boolean;
  readonly is_multigraph:boolean;

  private edge_limit:number;
  private vertice_limit:number;
  private free_eid:number;
  private free_vid:number;

  /**
   * @param  {NetworkArgs} [args={}]
   */
  constructor (args:NetworkArgs = {}) {
    this.edges = new Map();
    this.vertices = new Map();
    this.is_directed = args.is_directed ?? false;
    this.edge_limit = args.edge_limit ?? 500;
    this.vertice_limit = args.vertice_limit ?? 500;
    this.free_eid = 0;
    this.free_vid = 0;
    this.is_multigraph = args.is_multigraph ?? false;
  }
  
  /**
   * Get network's weight.
   * 
   * A network's weight is the sum of all its vertices' weights
   * @returns number
   */
  get weight () : number {
      let network_weight = 0;

      this.vertices.forEach(vertice => {
        network_weight += vertice.weight;
      });

      return network_weight;
  }

  /**
   * Get network's [genus](https://en.wikipedia.org/wiki/Genus_%28mathematics%29).
   * @returns number
   */
  get genus () : number {
    return this.edges.size - this.vertices.size + 1;
  }

  /**
   * Get the values of the vertices.
   * @returns base_id[]
   */
  get vertice_list () : Vertice[] {
    return [...this.vertices.values()];
  }

  /**
   * Size of the [maximum clique possible](https://www.wikiwand.com/en/Clique_(graph_theory)) with the network's number of verices.
   * @returns number
   */
  get clique_size () : number {
    return this.vertices.size * (this.vertices.size - 1) / 2;
  }

  /**
   * Returns the network's [density](https://www.baeldung.com/cs/graph-density)
   * @returns number
   */
  get density () : number {
    return this.edges.size / this.clique_size;
  }

  /**
   * @param  {EdgeArgs} args
   */
  addEdge (args:EdgeArgs) {
    args.do_force ??= true;
    args.weight ??= 1;
    
    args.id ??= this.newEID();

    if (this.edges.has(args.id))
      throw { message: ERROR.EXISTING_EDGE };

    if (this.edges.size >= this.edge_limit)
      throw { message: ERROR.EDGE_LIMIT };

    if (!args.do_force) {
      if (!this.vertices.has(args.from))
        throw { message: ERROR.INEXISTENT_VERTICE, vertice: args.from };
      if (!this.vertices.has(args.to))
        throw { message: ERROR.INEXISTENT_VERTICE, vertice: args.to };
    } else {
      if (!this.vertices.has(args.from)) this.addVertice({ id: args.from });
      if (!this.vertices.has(args.to)) this.addVertice({ id: args.to });
    }

    if (!this.is_multigraph && this.hasEdge(args.from, args.to ))
      throw { message: ERROR.NOT_MULTIGRAPH };


    this.edges.set(args.id, new Edge(args));
  }
  
  /**
   * @param  {VerticeArgs} args
   */
  addVertice (args:VerticeArgs) {
    if (this.vertices.size >= this.vertice_limit)
      throw { message: ERROR.VERTICE_LIMIT };
    if (args.id !== undefined && this.vertices.has(args.id))
      throw { message: ERROR.EXISTING_VERTICE };

    this.vertices.set(args.id, new Vertice(args));
  }

  /**
   * Removes vertice with given id
   * @param  {base_id} id
   */
  removeVertice (id:base_id) {
    if (!this.vertices.has(id))
      throw { message: ERROR.INEXISTENT_VERTICE, vertice: id };

    this.vertices.delete(id);
  }

  /**
   * Removes an edge between the two vertices.
   * 
   * If the network is a multigraph, an ID is needed to remove a specific edge.
   * @param  {Object} args
   * @param  {base_id} args.from
   * @param  {base_id} args.to
   * @param  {base_id} [args.id]
   */
  removeEdge (args: { from:base_id, to:base_id, id?:base_id }) {
    if (args.id !== undefined) {
        this.removeMultigraphEdge(args.id);
        return;
    }
    else if (this.is_multigraph) {
      throw { message: ERROR.UNDEFINED_ID, id: args.id };
    }

    const { from, to } = args;
    this.edges.forEach((edge, id) => {
      const { from: a, to: b } = edge.vertices;
        if ((a === from && b === to) || (b === from && a === to)) {
          this.edges.delete(id);
          return;
        }
    });
  }

  /**
   * Returns a list of edges between two given nodes.
   * 
   * If the network is not a multigraph, the list will always be either empty or have only one item.
   * @param  {base_id} from
   * @param  {base_id} to
   * @returns base_id[]
   */
  getEdgesBetween (from:base_id, to:base_id) : base_id[] {
    const edge_list:base_id[] = [];

    this.edges.forEach((edge, id) => {
      const { from: a, to: b } = edge.vertices;
      if ((a === from && b === to) || (b === from && a === to)) {
        edge_list.push(id);
      }
    });

    return edge_list;
  }

  /**
   * Returns true if an edge (undirected) between from and to exists.
   * @param  {base_id} from
   * @param  {base_id} to
   * @returns boolean
   */
  hasEdge (from:base_id, to:base_id) : boolean {
    let has_edge = false;

    this.edges.forEach(({ vertices }) => {
      const { from: a, to: b } = vertices;
      if ((a === from && b === to)){
        if (this.is_directed || (b === from && a === to)) {
          has_edge = true;
          return;
        }
      }
    });

    return has_edge;
  }

  /**
   * Returns true if an edge with the given id exists
   * @param  {base_id} id
   * @returns boolean
   */
  hasVertice (id:base_id) : boolean {
    return this.vertices.has(id);
  }

  /**
   * Get in-neighbors of a given vertice.
   * 
   * Returns [] if network is undirected.
   * @param  {base_id} id
   * @returns base_id[]
   */
  inNeighbors (id:base_id) : base_id[] {
    const in_neighbors:base_id[] = [];
    if (!this.is_directed) return in_neighbors;

    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (to === id) in_neighbors.push(from);
    });

    return in_neighbors;
  }

  /**
   * Get out-neighbors of a given vertice.
   * 
   * Returns [] if network is undirected.
   * @param  {base_id} id
   * @returns base_id[]
   */
  outNeighbors (id:base_id) : base_id[] {
    const out_neighbors:base_id[] = [];
    if (!this.is_directed) return out_neighbors;

    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (from === id) out_neighbors.push(to);
    });

    return out_neighbors;
  }

  /**
   * Get list of neighbors to a vertice.
   * @param  {base_id} id
   * @returns base_id
   */
  neighbors (id:base_id) : base_id[] {
    let neighborhood:base_id[] = [];

    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (from === id) neighborhood.push(to);
      else if (to === id) neighborhood.push(from);
    });

    return neighborhood;
  }

  /**
   * Return the degree of a vertice with the given ID.
   * @param  {base_id} id
   * @returns number
   */
  degree (id:base_id) : number {
    let vertice_degree = 0;

    this.edges.forEach(({ vertices }) => {
      const { from: a, to: b } = vertices;
      if (a === id || b === id) vertice_degree++;
    });

    return vertice_degree;
  }

  /**
   * Return the in-degree of a vertice.
   * 
   * The in-degree of a vertice is the sum of the dregrees of the edges that are directed to it.
   * @param  {base_id} id
   * @returns number
   */
  inDegree (id:base_id) : number {
    let in_degree = 0;
    if (!this.is_directed) return in_degree;

    this.edges.forEach(({ vertices }) => {
      const { to } = vertices;
      if (to === id) in_degree++;
    });

    return in_degree;
  }

  /**
   * Return the out-degree of a vertice.
   * 
   * The out-degree of a vertice is the sum of the dregrees of the edges that are directed away from it.
   * @param  {base_id} id
   * @returns number
   */
  outDegree (id:base_id) : number {
    let out_degree = 0;
    if (!this.is_directed) return out_degree;

    this.edges.forEach(({ vertices }) => {
      const { from } = vertices;
      if (from === id) out_degree++;
    });

    return out_degree;
  }

  /**
   * List of vertices with negative weight.
   * @returns Vertice[]
   */
  negativeVertices () : Vertice[] {
    const { vertice_list } = this;
    return vertice_list.filter(vertice => {
      return vertice.weight < 0;
    });
  }

  /**
   * List of vertices with positive weight.
   * @returns Vertice[]
   */
  positiveVertices () : Vertice[] {
    const { vertice_list } = this;
    return vertice_list.filter(vertice => {
      return vertice.weight > 0;
    });
  }

  /**
   * List of vertices with zero weight.
   * @returns Vertice[]
   */
  zeroVertices () : Vertice[] {
    const { vertice_list } = this;
    return vertice_list.filter(vertice => {
      return vertice.weight == 0;
    });
  }

  /**
   * [Assortativity](https://www.wikiwand.com/en/Assortativity) of a given vertice.
   * @param  {base_id} id
   * @returns number
   */
  assortativity (id:base_id) : number {
    let vertice_assortativity = 0;
    
    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (from === id) 
        vertice_assortativity += this.degree(to);
      else if (to === id)
        vertice_assortativity += this.degree(from);
    });

    return vertice_assortativity / this.degree(id);
  }

  // TODO: complement function

  /**
   * Generates a random ID that has not yet been used in the network
   * @returns base_id
   */
  newVID () : base_id {
    let id = this.free_vid++;
    while (this.vertices.has(id)) {
      id = Math.floor(Math.random() * this.vertice_limit);
    }
    return id;
  }

  private removeMultigraphEdge (id:base_id) {
    this.edges.delete(id);
  }

  private newEID () {
    let id = this.free_eid++;
    while (this.edges.has(id)) {
      id = Math.floor(Math.random() * this.edge_limit);
    }
    return id;
  }
}


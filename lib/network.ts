import { Vertex } from "./vertex.ts";
import { Edge } from "./edge.ts";
import { base_id, VertexArgs, EdgeArgs, NetworkArgs, ERROR } from './enums.ts'

export class Network {
  readonly edges:Map<base_id, Edge>;
  readonly vertices:Map<base_id, Vertex>;

  readonly is_directed:boolean;
  readonly is_multigraph:boolean;

  private edge_limit:number;
  private vertex_limit:number;
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
    this.vertex_limit = args.vertex_limit ?? 500;
    this.free_eid = 0;
    this.free_vid = 0;
    // TODO: handle multigraphs
    this.is_multigraph = false;
  }
  
  get args () : NetworkArgs {
    return {
      is_directed:this.is_directed,
      is_multigraph:this.is_multigraph,
      edge_limit:this.edge_limit,
      vertex_limit:this.edge_limit
    }
  }

  /**
   * Get network's weight.
   * 
   * A network's weight is the sum of all its vertices' weights
   * @returns number
   */
  get weight () : number {
      let network_weight = 0;

      this.vertices.forEach(vertex => {
        network_weight += vertex.weight;
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
  get vertex_list () : Vertex[] {
    return [...this.vertices.values()];
  }

  get edge_list () : Edge[] {
    return [...this.edges.values()];
  }

  /**
   * Number of edges in the [maximum clique possible](https://www.wikiwand.com/en/Clique_(graph_theory)) with the network's number of verices.
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
        throw { message: ERROR.INEXISTENT_VERTICE, vertex: args.from };
      if (!this.vertices.has(args.to))
        throw { message: ERROR.INEXISTENT_VERTICE, vertex: args.to };
    } else {
      if (!this.vertices.has(args.from)) this.addVertex({ id: args.from });
      if (!this.vertices.has(args.to)) this.addVertex({ id: args.to });
    }

    if (!this.is_multigraph && this.hasEdge(args.from, args.to ))
      throw { message: ERROR.NOT_MULTIGRAPH };


    this.edges.set(args.id, new Edge(args));
  }
  
  /**
   * Add multiple edges from a map of edges.
   * @param  {Map<base_id, Edge>} edge_map
   */
  addEdgeMap (edge_map:Map<base_id, Edge>) {
    edge_map.forEach((edge, id) => this.edges.set(id, edge));
  }

  /**
   * Add multiple edges from a list of EdgeArgs.
   * @param  {EdgeArgs[]} edge_list
   */
  addEdgeList (edge_list:EdgeArgs[]) {
    edge_list.forEach((edge_args, id) => this.edges.set(id, new Edge(edge_args)));
  }
  
  /**
   * Removes an edge between the two given vertices.
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

    this.edges.forEach(({ vertices }, id) => {
        if (this.checkEdgeIsSame(vertices, args)) {
          this.edges.delete(id);
          return;
        }
    });
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
      if (this.checkEdgeIsSame(vertices, { from, to }, false)) {
        has_edge = true;
        return;
      }
    });

    return has_edge;
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

    this.edges.forEach(({ vertices }, id) => {
      if (this.checkEdgeIsSame(vertices, { from, to })) {
        edge_list.push(id);
      }
    });

    return edge_list;
  }

  /**
   * @param  {VertexArgs} args
   */
  addVertex (args:VertexArgs) {
    if (this.vertices.size >= this.vertex_limit)
      throw { message: ERROR.VERTICE_LIMIT };
    if (args.id !== undefined && this.vertices.has(args.id))
      throw { message: ERROR.EXISTING_VERTICE };

    this.vertices.set(args.id, new Vertex(args));
  }
  
  /**
   * Add multiple vertices from a map of vertices.
   * @param  {Map<base_id, Vertex>} vertex_map
   */
  addVertexMap (vertex_map:Map<base_id, Vertex>) {
    vertex_map.forEach((vertex, id) => this.vertices.set(id, vertex));
  }

  /**
   * Add multiple vertices from a list of VertexArgs.
   * @param  {VertexArgs[]} vertex_list
   */
  addVertexList (vertex_list:VertexArgs[]) {
    vertex_list.forEach((vertex_args, id) => this.vertices.set(id, new Vertex(vertex_args)));
  }
  
  /**
   * Removes vertex with given id.
   * @param  {base_id} id
   */
  removeVertex (id:base_id) {
    if (!this.vertices.has(id))
      throw { message: ERROR.INEXISTENT_VERTICE, vertex: id };

    this.vertices.delete(id);

    const edge_removal:base_id[] = [];

    this.edges.forEach(({ vertices }, key) => {
      const { from, to } = vertices;
      if (from === id || to === id) {
        edge_removal.push(key);
      }
    });

    edge_removal.forEach(edge_key => this.edges.delete(edge_key));
  }

  /**
   * Returns true if an edge with the given id exists
   * @param  {base_id} id
   * @returns boolean
   */
  hasVertex (id:base_id) : boolean {
    return this.vertices.has(id);
  }

  /**
   * Get in-neighbors of a given vertex.
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
   * Get out-neighbors of a given vertex.
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
   * Get list of neighbors to a vertex.
   * @param  {base_id} id
   * @returns base_id
   */
  neighbors (id:base_id) : base_id[] {
    const neighborhood:base_id[] = [];

    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (from === id) neighborhood.push(to);
      else if (to === id) neighborhood.push(from);
    });

    return neighborhood;
  }

  /**
   * Return the degree of a vertex with the given ID.
   * @param  {base_id} id
   * @returns number
   */
  degree (id:base_id) : number {
    let vertex_degree = 0;

    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (from === id || to === id) vertex_degree++;
    });

    return vertex_degree;
  }

  /**
   * Return the in-degree of a vertex.
   * 
   * The in-degree of a vertex is the sum of the dregrees of the edges that are directed to it.
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
   * Return the out-degree of a vertex.
   * 
   * The out-degree of a vertex is the sum of the dregrees of the edges that are directed away from it.
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
   * @returns Vertex[]
   */
  negativeVertex () : Vertex[] {
    const { vertex_list } = this;
    return vertex_list.filter(vertex => {
      return vertex.weight < 0;
    });
  }

  /**
   * List of vertices with positive weight.
   * @returns Vertex[]
   */
  positiveVertex () : Vertex[] {
    const { vertex_list } = this;
    return vertex_list.filter(vertex => {
      return vertex.weight > 0;
    });
  }

  /**
   * List of vertices with zero weight.
   * @returns Vertex[]
   */
  zeroVertex () : Vertex[] {
    const { vertex_list } = this;
    return vertex_list.filter(vertex => {
      return vertex.weight == 0;
    });
  }

  /**
   * [Assortativity](https://www.wikiwand.com/en/Assortativity) of a given vertex.
   * @param  {base_id} id
   * @returns number
   */
  assortativity (id:base_id) : number {
    let vertex_assortativity = 0;
    
    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (from === id) 
        vertex_assortativity += this.degree(to);
      else if (to === id)
        vertex_assortativity += this.degree(from);
    });

    return vertex_assortativity / this.degree(id);
  }

  /**
   * Creates a [complement](https://www.wikiwand.com/en/Complement_graph) network.
   * @returns Network
   */
  complement () : Network {
    const complement_network = new Network({ is_directed: this.is_directed });
    
    this.vertices.forEach((vertex_a) => {
      const { id: id_a } = vertex_a;
      this.vertices.forEach((vertex_b) => {
        const { id: id_b } = vertex_b;
        if (id_a !== id_b) {
          if (!this.hasEdge(id_a, id_b))
            complement_network.addEdge({ from: id_a, to: id_b });
          if (complement_network.is_directed && !this.hasEdge(id_b, id_a))
            complement_network.addEdge({ from: id_b, to: id_a });
        }
      });
    });

    return complement_network;
  }

  /**
   * Creates an [ego network](https://transportgeography.org/contents/methods/graph-theory-definition-properties/ego-network-graph/) of the vertex with the given id.
   * @param  {base_id} id
   * @returns Network
   */
  ego (id:base_id) : Network {
    const ego_network = new Network({ is_directed: this.is_directed });

    this.edges.forEach(edge => {
      const { from, to } = edge.vertices
      if (from === id || to === id) {
        ego_network.addEdge({ from, to });
      }
    });

    this.edges.forEach(({ vertices }) => {
      const { from, to } = vertices;
      if (ego_network.vertices.has(from) && ego_network.vertices.has(to))
        ego_network.addEdge({ from, to });
    });

    return ego_network;
  }

  /**
   * Returns a copy of the network.
   * @returns Network
   */
  copy () : Network {
    const network_copy = new Network(this.args);
    network_copy.addEdgeMap(this.edges);
    network_copy.addVertexMap(this.vertices);
    return network_copy;
  }

  /**
   * Calculates the [clustering coefficient](https://www.wikiwand.com/en/Clustering_coefficient) of a given vertex.
   * @param  {base_id} id
   * @returns number
   */
  clusteringCoefficient (id:base_id) : number {
    const ego_net = this.ego(id);

    if (ego_net.vertices.size <= 2) return 0;
    
    // Max edges in a network without the given vertix
    const max_edges = (ego_net.vertices.size - 1) * (ego_net.vertices.size - 2) / 2;
    let existing_edges = 0;
    
    ego_net.vertices.forEach(vertex => {
      if (vertex.id != id)
        ego_net.vertices.forEach(vertex_neighbor => {
          if (vertex_neighbor.id != id && ego_net.hasEdge(vertex_neighbor.id, vertex.id)) existing_edges++;
        });
    });
    
    return existing_edges / (2 * max_edges);
  }

  // TODO: averageClustering

  /**
   * Generates a random ID that has not yet been used in the network
   * @returns base_id
   */
  newVID () : base_id {
    let id = this.free_vid++;
    while (this.vertices.has(id)) {
      id = Math.floor(Math.random() * this.vertex_limit);
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

  private checkEdgeIsSame (edge_a:EdgeArgs, edge_b:EdgeArgs, is_directed = this.is_directed) : boolean {
    // TODO: multigraph -> edge needs to have the same id
    if (edge_a.from === edge_b.from && edge_a.to === edge_b.to)
      return true;
    else if (edge_a.to === edge_b.from && edge_a.from === edge_b.to && !is_directed)
      return true;
    return false;
  }
}


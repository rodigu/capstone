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
      if (!this.vertices.has(args.vertice_a))
        throw { message: ERROR.INEXISTENT_VERTICE, vertice: args.vertice_a };
      if (!this.vertices.has(args.vertice_b))
        throw { message: ERROR.INEXISTENT_VERTICE, vertice: args.vertice_b };
    } else {
      if (!this.vertices.has(args.vertice_a)) this.addVertice({ id: args.vertice_a });
      if (!this.vertices.has(args.vertice_b)) this.addVertice({ id: args.vertice_b });
    }

    if (!this.is_multigraph && this.hasEdge(args.vertice_a, args.vertice_b ))
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
   * If the network is a multigraph, an ID is needed to remove a specific edge.
   * @param  {Object} args
   * @param  {base_id} args.vertice_a
   * @param  {base_id} args.vertice_b
   * @param  {base_id} [args.id]
   */
  removeEdge (args: { vertice_a:base_id, vertice_b:base_id, id?:base_id }) {
    if (args.id !== undefined) {
        this.removeMultigraphEdge(args.id);
        return;
    }
    else if (this.is_multigraph) {
      throw { message: ERROR.UNDEFINED_ID, id: args.id };
    }

    const { vertice_a, vertice_b } = args;
    this.edges.forEach((edge, id) => {
      const { a, b } = edge.vertices;
        if ((a === vertice_a && b === vertice_b) || (b === vertice_a && a === vertice_b)) {
          this.edges.delete(id);
          return;
        }
    });
  }

  /**
   * Returns a list of edges between two given nodes.
   * If the network is not a multigraph, the list will always be either empty or have only one item.
   * @param  {base_id} vertice_a
   * @param  {base_id} vertice_b
   * @returns base_id[]
   */
  getEdgesBetween (vertice_a:base_id, vertice_b:base_id) : base_id[] {
    const edge_list:base_id[] = [];

    this.edges.forEach((edge, id) => {
      const { a, b } = edge.vertices;
      if ((a === vertice_a && b === vertice_b) || (b === vertice_a && a === vertice_b)) {
        edge_list.push(id);
      }
    });

    return edge_list;
  }

  
  /**
   * Returns true if an edge between vertice_a and vertice_b exists.
   * @param  {base_id} vertice_a
   * @param  {base_id} vertice_b
   * @returns boolean
   */
  hasEdge (vertice_a:base_id, vertice_b:base_id) : boolean {
    let has_edge = false;

    this.edges.forEach(({ vertices }) => {
      const { a, b } = vertices;
      if ((a === vertice_a && b === vertice_b)){
        if (this.is_directed || (b === vertice_a && a === vertice_b)) {
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


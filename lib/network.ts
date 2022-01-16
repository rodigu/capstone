import { Vertice } from "./vertice.ts";
import { Edge } from "./edge.ts";

export type base_id = number | string;

export class Network {
  readonly edges: Map<base_id, Edge>;
  readonly vertices: Map<base_id, Vertice>;

  readonly is_directed: boolean;
  readonly is_multigraph: boolean;

  private edge_limit: number;
  private vertice_limit: number;
  private free_eid: number;
  private free_vid: number;

  constructor (args: { is_directed?: boolean, is_multigraph?: boolean, edge_limit?: number, vertice_limit?: number } = {}) {
    this.edges = new Map();
    this.vertices = new Map();
    this.is_directed = args.is_directed ?? false;
    this.edge_limit = args.edge_limit ?? 500;
    this.vertice_limit = args.vertice_limit ?? 500;
    this.free_eid = 0;
    this.free_vid = 0;
    this.is_multigraph = args.is_multigraph ?? false;
  }

  addEdge (args: { vertice_a: base_id, vertice_b: base_id,
                  weight?: number, do_force?: boolean, id?: number }) {

    args.do_force ??= true;
    args.id ??= this.newEID();
    args.weight ??= 1;

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

    this.edges.set(args.id, new Edge({ vertice_a: args.vertice_a, vertice_b: args.vertice_b, weight: args.id }));
  }

  addVertice (args: { id?: base_id, weight?: number } = {}) {
    if (this.vertices.size >= this.vertice_limit)
      throw { message: ERROR.VERTICE_LIMIT };
    if (args.id !== undefined && this.vertices.has(args.id))
      throw { message: ERROR.EXISTING_VERTICE };

    args.id ??= this.newVID();

    this.vertices.set(args.id, new Vertice({ id: args.id, weight: args.weight }));
  }

  removeVertice (id: base_id) {
    if (!this.vertices.has(id))
      throw { message: ERROR.INEXISTENT_VERTICE, vertice: id };

    this.vertices.delete(id);
  }

  removeEdge (args: { vertice_a: base_id, vertice_b: base_id, id?: base_id }) {
    if (this.is_multigraph) {
      if (args.id === undefined)
        throw { message: ERROR.UNDEFINED_ID, id: args.id };
      else
        this.removeMultigraphEdge(args.id);
      return;
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

  getEdgesBetween (vertice_a:base_id, vertice_b:base_id) : base_id[] {
    let edge_list:base_id[] = [];

    this.edges.forEach((edge, id) => {
      const { a, b } = edge.vertices;
      if ((a === vertice_a && b === vertice_b) || (b === vertice_a && a === vertice_b)) {
        edge_list.push(id);
      }
    });

    return edge_list;
  }

  hasEdge (vertice_a:base_id, vertice_b:base_id) : boolean {
    let has_edge:boolean = false;

    this.edges.forEach(({ vertices }, id) => {
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

  hasVertice (id:base_id) : boolean {
    return this.vertices.has(id);
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

  private newVID () {
    let id = this.free_vid++;
    while (this.vertices.has(id)) {
      id = Math.floor(Math.random() * this.vertice_limit);
    }
    return id;
  }
}


const ERROR = {
  UNDEFINED_VALUES: "Undefined values being given as arguments!",
  EDGE_LIMIT: "Can't add new edge. Limit of Edges exceeded",
  VERTICE_LIMIT: "Can't add new vertice. Limit of Vertices exceeded",
  EXISTING_EDGE: "Trying to add an edge with already existing ID",
  EXISTING_VERTICE: "Trying to add a vertice with already existing ID",
  INEXISTENT_VERTICE: "Vertice doesn't exist",
  NOT_MULTIGRAPH: "Trying to add multiple edges between two vertices. Graph is not a multigraph!",
  UNDEFINED_ID: "Tried to use undefined id as input"
};

export type base_id = string|number;

export interface VerticeArgs {
    id:base_id;
    weight?:number;
}

export interface EdgeArgs {
    vertice_a:base_id;
    vertice_b:base_id;
    id?:base_id;
    weight?:number;
    do_force?:boolean;
}

export interface NetworkArgs {
    is_directed?:boolean;
    is_multigraph?:boolean;
    edge_limit?:number;
    vertice_limit?:number;
}
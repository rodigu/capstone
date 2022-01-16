import { Network, base_id } from "./network.ts";


export function networkWeight (network:Network) : number {
    let weight = 0;
    const { vertices } = network;

    vertices.forEach(vertice => {
      weight += vertice.weight;
    });

    return weight;
}

export function genus (network:Network) : number {
  return network.edges.size - network.vertices.size + 1;
}


export function outNeighbors (network:Network, id:base_id) : base_id[] | null{
  if (!network.is_directed) return null;

  const { vertices } = network;
  const out_neighbors:base_id[] = [];
  vertices.forEach(vertice => {
    if (network.hasEdge(id, vertice.id)) out_neighbors.push(vertice.id);
  });

  return out_neighbors;
}

export function randomNetworkGen (args: { number_vertices:number, number_edges:number, is_directed?:boolean }) : Network {
  let { number_vertices, number_edges, is_directed } = args;
  is_directed ??= false;
  const net = new Network({ is_directed });

  for (let vertice = 0; vertice < number_vertices; vertice++)
    net.addVertice({ id: vertice });
  while (net.edges.size < number_edges) {
    const vertice_a = Math.floor(Math.random() * number_vertices);
    const vertice_b = Math.floor(Math.random() * number_vertices);
    net.addEdge({ vertice_a, vertice_b });
  }

  return net;
}

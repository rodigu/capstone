import { Network } from "./network.ts";

/**
 * Tries to generate a network with the given number of nodes and edges.
 * @param  {Object} args
 * @param  {number} args.number_vertices
 * @param  {number} args.number_edges
 * @param  {boolean} [args.is_directed]
 * @returns Network
 */
export function randomNetworkGen (args: { number_vertices:number, number_edges:number, is_directed?:boolean }) : Network {
  let { number_vertices, number_edges, is_directed } = args;
  is_directed ??= false;
  const net = new Network({ is_directed });

  for (let vertice = 0; vertice < number_vertices; vertice++)
    net.addVertice({ id: vertice });
  while (net.edges.size < number_edges) {
    const from = Math.floor(Math.random() * number_vertices);
    const to = Math.floor(Math.random() * number_vertices);
    net.addEdge({ from, to });
  }

  return net;
}

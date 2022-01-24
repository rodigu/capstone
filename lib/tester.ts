import * as nets from "./ne.ts";

console.log("---Starting Tests---");

function logNetwork(network: nets.Network) {
  console.log(network.vertex_list);
  console.log(network.edge_list);
}

function valuesTest(network: nets.Network) {
  console.log(
    `Weight:                ${network.weight}\n` +
      `Genus:                 ${network.genus}\n` +
      `Clique Size:           ${network.max_edges}\n` +
      `Density:               ${network.density}\n` +
      `Clustering for ETH:    ${network.clustering("ETH")}\n`
  );
}

function algorithmTest(network: nets.Network) {
  const k_core = 10;
  console.log(`${k_core} core-decomposition:\n`);
  const k10 = network.core(k_core);
  logNetwork(k10);
  console.log(
    `${k_core} core-decomposition vertice number: ${k10.vertices.size}\n`
  );
  console.log(`${k_core} core-decomposition edge number: ${k10.edges.size}\n`);
}

const net_csv = await nets.loadAdjacencyMatrix("./data/networkMatrix.csv");
console.log("CSV loaded");
logNetwork(net_csv);
valuesTest(net_csv);
algorithmTest(net_csv);

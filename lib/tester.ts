import * as nets from "./ne.ts";

function logNetwork(network: nets.Network) {
  return (
    "\n" +
    JSON.stringify(network.vertex_list) +
    "\n" +
    JSON.stringify(network.edge_list) +
    "\n"
  );
}

function valuesTest(network: nets.Network) {
  return (
    "--Values Test--\n" +
    `Weight:                ${network.weight}\n` +
    `Genus:                 ${network.genus}\n` +
    `Clique Size:           ${network.max_edges}\n` +
    `Density:               ${network.density}\n` +
    `Clustering for ETH:    ${network.clustering("ETH")}\n`
  );
}

function algorithmTest(network: nets.Network) {
  let test_string = "--Algorithms Tests--\n";

  const k_core = 10;
  const k10 = network.core(k_core);
  test_string += `${k_core}-core decomposition vertice number: ${k10.vertices.size}\n`;
  test_string += `${k_core}-core decomposition edge number: ${k10.edges.size}`;

  return test_string;
}

function getTestTime(): string {
  const date = new Date();
  return (
    date.getDate() +
    "_" +
    date.getMonth() +
    "_" +
    date.getFullYear() +
    "_" +
    date.getHours()
  );
}
const net_csv = await nets.loadAdjacencyMatrix("./data/networkMatrix.csv");

const test_data = valuesTest(net_csv) + "\n" + algorithmTest(net_csv);

Deno.writeTextFile(`./data/test_${getTestTime()}.txt`, test_data);

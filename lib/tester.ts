import * as nets from './ne.ts';

console.log("---Starting Tests---");


function logNetwork (network:nets.Network) {
    console.log(network.vertex_list);
    console.log(network.edge_list);
}

function valuesTest (network:nets.Network) {
    console.log(`Weight:                ${network.weight}\n` +
                `Genus:                 ${network.genus}\n` +
                `Clique Size:           ${network.max_edges}\n` +
                `Density:               ${network.density}\n` +
                `Clustering for ETH:    ${network.clustering('ETH')}\n`);
}

// basicTest(net);
const net_csv = await nets.loadAdjacencyMatrix('./data/networkMatrix.csv');
console.log('CSV loaded');
valuesTest(net_csv);
logNetwork(net_csv);

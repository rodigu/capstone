import * as nets from './ne.ts';

console.log("---Starting Tests---");


function logNetwork (network:nets.Network) {
    console.log(network.vertex_list);
    console.log(network.edge_list);
}

function basicTest (network:nets.Network) {
    const test_vertex = 2;
    
    logNetwork(network);

    network.removeVertex(test_vertex);
    console.log(`\nRemoved ${test_vertex}\n`);
    
    logNetwork(network);
    console.log(`\nHas vertex ${test_vertex}: ${network.hasVertex(test_vertex)}`);

    network.removeEdge({ from: 'a', to: 'b' });
    console.log(`\nRemoved edge\n`);
    logNetwork(network);
}

function valuesTest (network:nets.Network) {
    console.log(`Weight:                ${network.weight}\n` +
                `Genus:                 ${network.genus}\n` +
                `Clique Size:           ${network.max_edges}\n` +
                `Density:               ${network.density}\n` +
                `Clustering for ETH:    ${network.clusteringCoefficient('ETH')}\n`);
}

// basicTest(net);
const net_csv = await nets.loadAdjacencyMatrix('./data/networkMatrix.csv');
console.log('CSV loaded');
valuesTest(net_csv);
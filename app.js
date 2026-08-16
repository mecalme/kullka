// Sua base local de teste (pode adicionar os códigos físicos que tem aí)
const meusProdutosLocais = {
    "7891000100103": { nome: "Leite Condensado Moça 395g", marca: "Nestlé" },
    "7896005801108": { nome: "Tempero Kitano Exemplo", marca: "Kitano" }
};

let modoOperacao = "";

function setModo(modo) {
    modoOperacao = modo;
    document.getElementById("modo-atual").innerHTML = `Modo selecionado: <b>${modo.toUpperCase()}</b>`;
    iniciarLeitor();
}

// Inicializa a câmera para leitura de EAN-13
function iniciarLeitor() {
    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                facingMode: "environment"
            },
        },
        decoder : {
            readers : ["ean_reader"]
        }
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar a câmera: ", err);
            return;
        }
        console.log("Câmera inicializada com sucesso!");
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        let codigoLido = result.codeResult.code;
        buscarProdutoInteligente(codigoLido);
    });
}

// Função principal: Procura localmente e, se não achar, busca na internet automaticamente
async function buscarProdutoInteligente(codigo) {
    console.log("Código escaneado: ", codigo);
    
    document.getElementById("produto-nome").innerText = "Buscando produto...";
    document.getElementById("produto-marca").innerText = `EAN: ${codigo}`;

    // 1. Tenta achar na base local primeiro (mais rápido)
    if (meusProdutosLocais[codigo]) {
        let p = meusProdutosLocais[codigo];
        exibirResultado(p.nome, p.marca, codigo, "Base Local");
        return;
    }

    // 2. Se NÃO achar localmente, busca na internet (API pública da nuvem)
    try {
        console.log("Produto não está na base local. Consultando a internet...");
        let resposta = await fetch(`https://br.openfoodfacts.org/api/v0/product/${codigo}.json`);
        let dados = await resposta.json();

        if (dados.status === 1 && dados.product) {
            // Encontrou na internet!
            let nomeNaNet = dados.product.product_name || "Produto sem nome na web";
            let marcaNaNet = dados.product.brands || "Marca Diversa";

            exibirResultado(nomeNaNet, marcaNaNet, codigo, "Encontrado na Internet 🌐");

            // Opcional: Adiciona automaticamente na lista local para consultas futuras
            meusProdutosLocais[codigo] = { nome: nomeNaNet, marca: marcaNaNet };
        } else {
            // Não achou nem na base local e nem na internet
            document.getElementById("produto-nome").innerText = "Produto Novo / Não Cadastrado";
            document.getElementById("produto-marca").innerText = `EAN: ${codigo} - Pronto para cadastro`;
        }
    } catch (erro) {
        console.error("Erro ao buscar na internet:", erro);
        document.getElementById("produto-nome").innerText = "Erro de conexão com a internet";
        document.getElementById("produto-marca").innerText = `EAN: ${codigo}`;
    }
}

function exibirResultado(nome, marca, codigo, origem) {
    document.getElementById("produto-nome").innerText = nome;
    document.getElementById("produto-marca").innerText = `Marca: ${marca} | Origem: ${origem}`;
    console.log(`Sucesso (${origem}) [Modo: ${modoOperacao}]: ${nome} - EAN: ${codigo}`);
}
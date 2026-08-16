let modoAtual = "";
let aguardandoRevisao = false;
let eanAtual = "";

function setModo(modo) {
    if (!modoAtual) {
        // Inicia pela primeira vez
        iniciarLeitor();
    }
    modoAtual = modo;
    document.getElementById("modo-atual").innerHTML = `Modo selecionado: <b>${modo === 'recebimento' ? 'Recebimento Rampa' : 'Endereçar Box'}</b>`;
}

function iniciarLeitor() {
    try {
        Quagga.stop();
    } catch (e) {}

    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            },
        },
        decoder : {
            readers : ["ean_reader", "ean_8_reader", "code_128_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar a câmera:", err);
            return;
        }
        Quagga.start();
        aguardandoRevisao = false;
    });

    Quagga.onDetected(function(result) {
        if (aguardandoRevisao) return;

        if (result && result.codeResult && result.codeResult.code) {
            eanAtual = result.codeResult.code;
            aguardandoRevisao = true;

            // Exibe o painel de revisão
            document.getElementById("painel-revisao").style.display = "block";
            document.getElementById("rev-ean").innerText = eanAtual;
            document.getElementById("input-nome").value = "Buscando produto na internet...";

            // Dispara a busca automática online
            buscarProdutoNaInternet(eanAtual);
        }
    });
}

async function buscarProdutoNaInternet(ean) {
    try {
        let resposta = await fetch(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`);
        let dados = await resposta.json();

        if (dados.status === 1 && dados.product) {
            let nomeProduto = dados.product.product_name || dados.product.brands || "Produto sem nome";
            let pesoQuantidade = dados.product.quantity ? ` (${dados.product.quantity})` : "";
            document.getElementById("input-nome").value = nomeProduto + pesoQuantidade;
        } else {
            document.getElementById("input-nome").value = "";
            document.getElementById("input-nome").placeholder = "Não encontrado. Digite o nome manualmente.";
        }
    } catch (erro) {
        console.error("Erro ao buscar na internet:", erro);
        document.getElementById("input-nome").value = "";
        document.getElementById("input-nome").placeholder = "Erro de rede. Digite o nome manualmente.";
    }
}

function cancelarRevisao() {
    // Limpa os campos e destrava a leitura para escanear de novo
    document.getElementById("input-nome").value = "";
    document.getElementById("input-lote").value = "";
    document.getElementById("input-fabricacao").value = "";
    document.getElementById("input-validade").value = "";
    document.getElementById("painel-revisao").style.display = "none";
    
    eanAtual = "";
    aguardandoRevisao = false;
}

function cadastrarProdutoFinal() {
    let nome = document.getElementById("input-nome").value;
    let lote = document.getElementById("input-lote").value;
    let fabricacao = document.getElementById("input-fabricacao").value;
    let validade = document.getElementById("input-validade").value;

    if (!nome) {
        alert("Por favor, informe o nome do produto.");
        return;
    }

    if (!lote || !validade) {
        alert("Por favor, preencha o Lote e a Data de Validade.");
        return;
    }

    let dadosDoItem = {
        modo: modoAtual || "Não especificado",
        ean: eanAtual,
        nome: nome,
        lote: lote,
        fabricacao: fabricacao,
        validade: validade,
        dataRegistro: new Date().toISOString()
    };

    console.log("Item cadastrado com sucesso:", dadosDoItem);
    alert(`Sucesso! Item "${nome}" (Lote: ${lote}) cadastrado.`);

    // Reseta tudo e volta a ler
    cancelarRevisao();
}

// Inicia o leitor automaticamente ao carregar a página
window.onload = function() {
    iniciarLeitor();
};
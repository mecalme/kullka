let modoAtual = "";
let aguardandoRevisao = false;
let eanAtual = "";

// Inicia a câmera automaticamente ao carregar
window.addEventListener("DOMContentLoaded", () => {
    iniciarLeitor();
});

function setModo(modo) {
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

            // 1. ABRE O PAINEL IMEDIATAMENTE (Sem depender da internet)
            let painel = document.getElementById("painel-revisao");
            painel.style.display = "block";
            
            document.getElementById("rev-ean").innerText = eanAtual;
            document.getElementById("input-nome").value = "Consultando produto...";
            document.getElementById("input-lote").value = "";
            document.getElementById("input-fabricacao").value = "";
            document.getElementById("input-validade").value = "";

            // 2. Roda a busca na internet em segundo plano (não trava o painel se falhar)
            buscarProdutoNaInternet(eanAtual);
        }
    });
}

async function buscarProdutoNaInternet(ean) {
    try {
        let resposta = await fetch(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`, { mode: 'cors' });
        let dados = await resposta.json();

        if (dados.status === 1 && dados.product) {
            let nomeProduto = dados.product.product_name || dados.product.brands || "";
            let pesoQuantidade = dados.product.quantity ? ` (${dados.product.quantity})` : "";
            
            // Se achou, atualiza o campo. Se não, limpa para digitação manual
            document.getElementById("input-nome").value = nomeProduto ? (nomeProduto + pesoQuantidade) : "";
            if (!nomeProduto) {
                document.getElementById("input-nome").placeholder = "Não encontrado. Digite o nome manualmente.";
            }
        } else {
            document.getElementById("input-nome").value = "";
            document.getElementById("input-nome").placeholder = "Não cadastrado. Digite o nome manualmente.";
        }
    } catch (erro) {
        console.warn("Aviso: Falha na busca online ou sem internet.", erro);
        // Garante que o usuário possa digitar mesmo se a API cair
        document.getElementById("input-nome").value = "";
        document.getElementById("input-nome").placeholder = "Modo offline. Digite o nome manualmente.";
    }
}

function cancelarRevisao() {
    document.getElementById("input-nome").value = "";
    document.getElementById("input-lote").value = "";
    document.getElementById("input-fabricacao").value = "";
    document.getElementById("input-validade").value = "";
    
    document.getElementById("painel-revisao").style.display = "none";
    
    eanAtual = "";
    aguardandoRevisao = false;
}

function cadastrarProdutoFinal() {
    let nome = document.getElementById("input-nome").value.trim();
    let lote = document.getElementById("input-lote").value.trim();
    let fabricacao = document.getElementById("input-fabricacao").value;
    let validade = document.getElementById("input-validade").value;

    if (!nome || nome === "Consultando produto...") {
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

    cancelarRevisao();
}
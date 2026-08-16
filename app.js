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

            // Abre o painel instantaneamente
            let painel = document.getElementById("painel-revisao");
            painel.style.display = "block";
            
            document.getElementById("rev-ean").innerText = eanAtual;
            document.getElementById("input-nome").value = "Consultando produto...";
            document.getElementById("input-lote").value = "";
            document.getElementById("input-fabricacao").value = "";
            document.getElementById("input-validade").value = "";

            // Busca na internet em segundo plano
            buscarProdutoNaInternet(eanAtual);
        }
    });
}

// Função para aplicar máscara automática DD/MM/AAAA enquanto digita
function mascaraData(input) {
    let valor = input.value.replace(/\D/g, ""); // Remove tudo que não for dígito
    if (valor.length > 8) valor = valor.substring(0, 8); // Limita a 8 dígitos

    if (valor.length > 4) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4) + '/' + valor.substring(4);
    } else if (valor.length > 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    
    input.value = valor;
}

// Valida se a data DD/MM/AAAA é real
function validarData(strData) {
    let partes = strData.split('/');
    if (partes.length !== 3) return false;
    let dia = parseInt(partes[0], 10);
    let mes = parseInt(partes[1], 10);
    let ano = parseInt(partes[2], 10);

    if (ano < 2020 || ano > 2050 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
    
    let dataObj = new Date(ano, mes - 1, dia);
    return dataObj.getFullYear() === ano && dataObj.getMonth() === (mes - 1) && dataObj.getDate() === dia;
}

async function buscarProdutoNaInternet(ean) {
    try {
        let resposta = await fetch(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`, { mode: 'cors' });
        let dados = await resposta.json();

        if (dados.status === 1 && dados.product) {
            let nomeProduto = dados.product.product_name || dados.product.brands || "";
            let pesoQuantidade = dados.product.quantity ? ` (${dados.product.quantity})` : "";
            
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
    let fabricacaoStr = document.getElementById("input-fabricacao").value.trim();
    let validadeStr = document.getElementById("input-validade").value.trim();

    if (!nome || nome === "Consultando produto...") {
        alert("Por favor, informe o nome do produto.");
        return;
    }

    if (!lote || !validadeStr) {
        alert("Por favor, preencha o Lote e a Data de Validade.");
        return;
    }

    if (validadeStr.length !== 10 || !validarData(validadeStr)) {
        alert("Data de Validade inválida. Use o formato DD/MM/AAAA.");
        return;
    }

    if (fabricacaoStr && (fabricacaoStr.length !== 10 || !validarData(fabricacaoStr))) {
        alert("Data de Fabricação inválida. Use o formato DD/MM/AAAA.");
        return;
    }

    let dadosDoItem = {
        modo: modoAtual || "Não especificado",
        ean: eanAtual,
        nome: nome,
        lote: lote,
        fabricacao: fabricacaoStr || null,
        validade: validadeStr,
        dataRegistro: new Date().toISOString()
    };

    console.log("Item cadastrado com sucesso:", dadosDoItem);
    alert(`Sucesso! Item "${nome}" (Lote: ${lote}) cadastrado.`);

    cancelarRevisao();
}
let modoAtual = "";

function setModo(modo) {
    modoAtual = modo;
    document.getElementById("modo-atual").innerHTML = `Modo selecionado: <b>${modo === 'recebimento' ? 'Recebimento Rampa' : 'Endereçar Box'}</b>`;
    
    iniciarLeitor();
}

function iniciarLeitor() {
    Quagga.stop();

    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // Câmera traseira nativa
            },
        },
        decoder : {
            readers : ["ean_reader"]
        }
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar:", err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        var codigoLido = result.codeResult.code;
        console.log("Código lido: ", codigoLido);
        
        document.getElementById("produto-nome").innerText = "Código: " + codigoLido;
        document.getElementById("produto-marca").innerText = "Processando busca...";

        buscarProdutoInteligente(codigoLido);
    });
}

function testarCodigoManual() {
    var codigoExemplo = "7891000100103";
    document.getElementById("produto-nome").innerText = "Código Manual: " + codigoExemplo;
    buscarProdutoInteligente(codigoExemplo);
}

function buscarProdutoInteligente(ean) {
    if (ean === "7891000100103") {
        document.getElementById("produto-nome").innerText = "Leite Condensado Nestlé 395g";
        document.getElementById("produto-marca").innerText = "Nestlé";
    } else {
        document.getElementById("produto-nome").innerText = "Produto EAN: " + ean;
        document.getElementById("produto-marca").innerText = "Encontrado";
    }
}
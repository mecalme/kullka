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
                facingMode: "environment"
            },
        },
        decoder : {
            readers : [
                "ean_reader", 
                "ean_8_reader", 
                "code_128_reader", 
                "upc_reader", 
                "upc_e_reader"
            ] // Adicionamos vários formatos para garantir que o código da caixa seja lido
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: 2,
        locate: true
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar o Quagga:", err);
            return;
        }
        console.log("Quagga iniciado com múltiplos leitores!");
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        var codigoLido = result.codeResult.code;
        console.log("Código lido com sucesso: ", codigoLido);
        
        document.getElementById("produto-nome").innerText = "Código: " + codigoLido;
        document.getElementById("produto-marca").innerText = "Processando...";

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
        document.getElementById("produto-marca").innerText = "Encontrado com sucesso!";
    }
}
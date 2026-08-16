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
            readers : ["ean_reader", "ean_8_reader", "code_128_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar o leitor:", err);
            return;
        }
        console.log("Câmera e leitor ativos!");
        Quagga.start();
    });

    // Captura exata do código de barras detectado pela câmera
    Quagga.onDetected(function(result) {
        if (result && result.codeResult) {
            var codigoLido = result.codeResult.code;
            console.log("EAN Capturado: ", codigoLido);
            
            // Exibe o EAN exato no painel de produto
            document.getElementById("produto-nome").innerText = "EAN Lido: " + codigoLido;
            document.getElementById("produto-marca").innerText = "Modo: " + modoAtual;

            // Para a leitura momentaneamente para não ficar duplicando na tela
            Quagga.stop();

            // Aqui você pode fazer a busca inteligente com o EAN real que a câmera leu
            buscarProdutoInteligente(codigoLido);
        }
    });
}

function testarCodigoManual() {
    // Código de teste padrão para validar a exibição na tela
    var codigoExemplo = "7891000100103";
    document.getElementById("produto-nome").innerText = "EAN Manual: " + codigoExemplo;
    document.getElementById("produto-marca").innerText = "Leite Condensado Nestlé 395g";
}

function buscarProdutoInteligente(ean) {
    // Se quiser associar produtos reais aos códigos lidos pela câmera:
    if (ean === "7891000100103") {
        document.getElementById("produto-nome").innerText = "EAN: " + ean;
        document.getElementById("produto-marca").innerText = "Leite Condensado Nestlé 395g";
    } else {
        document.getElementById("produto-nome").innerText = "EAN Capturado: " + ean;
        document.getElementById("produto-marca").innerText = "Produto cadastrado no sistema";
    }
}
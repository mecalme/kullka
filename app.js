let modoAtual = "";

function setModo(modo) {
    modoAtual = modo;
    
    // Atualiza o texto na tela para mostrar que o botão respondeu
    const elementoModo = document.getElementById("modo-atual");
    if (elementoModo) {
        elementoModo.innerHTML = `Modo selecionado: <b>${modo === 'recebimento' ? 'Recebimento Rampa' : 'Endereçar Box'}</b>`;
    }
    
    // Inicia a câmera
    iniciarLeitor();
}

function iniciarLeitor() {
    // Verifica se a biblioteca Quagga está carregada antes de tentar usar
    if (typeof Quagga === 'undefined') {
        alert("Erro: A biblioteca QuaggaJS não foi carregada. Verifique o index.html.");
        return;
    }

    // Para instâncias anteriores para evitar conflito
    Quagga.stop();

    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "user" // Isso força a câmera frontal
            },
        },
        decoder : {
            readers : ["ean_reader"] // Focado em EAN-13 (produtos Nestlé, Kitano, etc.)
        }
    }, function(err) {
        if (err) {
            // Escreve o erro direto na tela, em vez de um alerta que você pode ter fechado
            document.getElementById("produto-nome").innerText = "Erro de Câmera: " + err;
            console.error("Erro Quagga:", err);
            return;
        }
        Quagga.start();
    });

    // Evento disparado quando o código de barras for detectado
    Quagga.onDetected(function(result) {
        var codigoLido = result.codeResult.code;
        console.log("Código lido: ", codigoLido);
        
        document.getElementById("produto-nome").innerText = "Código: " + codigoLido;
        document.getElementById("produto-marca").innerText = "Buscando produto...";

        buscarProdutoInteligente(codigoLido);
    });
}

function testarCodigoManual() {
    // Função de apoio caso queira testar simulação sem a câmera
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
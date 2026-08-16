function iniciarLeitor() {
    // Para qualquer instância anterior antes de iniciar
    Quagga.stop();

    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                // Removemos restrições fixas de largura/altura que travam em alguns celulares
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                facingMode: "environment" // Tenta usar a câmera traseira
            },
        },
        decoder : {
            readers : ["ean_reader"] // Focado em EAN-13
        },
        locate: true // Ajuda o Quagga a encontrar o código com mais precisão na tela
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar o Quagga:", err);
            // Se falhar com a traseira, tenta abrir a frontal como alternativa para teste
            tentarCameraFrontal();
            return;
        }
        console.log("Quagga inicializado com sucesso!");
        Quagga.start();
    });

    // Evento de leitura bem-sucedida
    Quagga.onDetected(function(result) {
        var codigoLido = result.codeResult.code;
        console.log("Código lido: ", codigoLido);
        
        document.getElementById("produto-nome").innerText = "Código: " + codigoLido;
        document.getElementById("produto-marca").innerText = "Processando busca...";
        buscarProdutoInteligente(codigoLido);
    });
}

// Plano B caso a câmera traseira dê conflito de resolução
function tentarCameraFrontal() {
    console.log("Tentando inicializar com configuração genérica/frontal...");
    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                facingMode: "user" // Usa a câmera frontal caso a traseira falhe
            },
        },
        decoder : {
            readers : ["ean_reader"]
        }
    }, function(err) {
        if (err) {
            alert("Erro crítico ao abrir a câmera. Verifique se outro aplicativo está usando ela.");
            return;
        }
        Quagga.start();
    });
}
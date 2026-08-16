let modoAtual = "";

function setModo(modo) {
    modoAtual = modo;
    document.getElementById("modo-atual").innerHTML = `Modo selecionado: <b>${modo === 'recebimento' ? 'Recebimento Rampa' : 'Endereçar Box'}</b>`;
    
    // Inicia o leitor de código de barras assim que o modo for escolhido
    iniciarLeitor();
}

function iniciarLeitor() {
    // Evita duplicar instâncias se já estiver rodando
    Quagga.stop();

    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'), // Elemento onde a câmera será exibida
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // Usa a câmera traseira do celular
            },
        },
        decoder : {
            readers : ["ean_reader"] // Focado em EAN-13 (produtos Nestlé, Kitano, etc.)
        }
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar o Quagga:", err);
            alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
            return;
        }
        console.log("Quagga inicializado com sucesso!");
        Quagga.start();
    });

    // Evento disparado quando um código de barras é lido com sucesso
    Quagga.onDetected(function(result) {
        var codigoLido = result.codeResult.code;
        console.log("Código lido: ", codigoLido);
        
        // Exibe na tela o código capturado
        document.getElementById("produto-nome").innerText = "Código: " + codigoLido;
        document.getElementById("produto-marca").innerText = "Processando busca...";

        // Chama a sua função de busca inteligente de produtos
        buscarProdutoInteligente(codigoLido);
    });
}

// Exemplo de função de busca para validar o fluxo
function buscarProdutoInteligente(ean) {
    // Aqui você integra com a sua base de dados ou API da Nestlé/Kitano
    if (ean === "7891000100103") {
        document.getElementById("produto-nome").innerText = "Leite Condensado Nestlé 395g";
        document.getElementById("produto-marca").innerText = "Nestlé";
    } else {
        document.getElementById("produto-nome").innerText = "Produto EAN: " + ean;
        document.getElementById("produto-marca").innerText = "Cadastrado / Encontrado";
    }
}
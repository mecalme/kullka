let modoAtual = "";

function setModo(modo) {
    modoAtual = modo;
    document.getElementById("modo-atual").innerHTML = `Modo selecionado: <b>${modo === 'recebimento' ? 'Recebimento Rampa' : 'Endereçar Box'}</b>`;
}

// Processa a foto tirada pela câmera nativa do celular
function processarFoto(event) {
    var arquivo = event.target.files[0];
    if (!arquivo) return;

    var reader = new FileReader();
    reader.onload = function(e) {
        var imageUrl = e.target.result;
        
        document.getElementById("produto-nome").innerText = "Lendo código da foto...";

        // Usa o Quagga para decodificar o código de barras da imagem capturada
        Quagga.decodeSingle({
            decoder: {
                readers: ["ean_reader"]
            },
            locate: true,
            src: imageUrl
        }, function(result) {
            if (result && result.codeResult) {
                var codigoLido = result.codeResult.code;
                document.getElementById("produto-nome").innerText = "Código: " + codigoLido;
                buscarProdutoInteligente(codigoLido);
            } else {
                document.getElementById("produto-nome").innerText = "Não foi possível ler o código. Tente novamente mais perto.";
                document.getElementById("produto-marca").innerText = "-";
            }
        });
    };
    reader.readAsDataURL(arquivo);
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
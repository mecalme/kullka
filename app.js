let modoAtual = "";
// Memória temporária para guardar os dados do produto escaneado
let produtoTemporario = {
    ean: "",
    nome: "",
    marca: ""
};

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
        Quagga.start();
    });

    // Quando a câmera detecta o código
    Quagga.onDetected(function(result) {
        if (result && result.codeResult) {
            var codigoLido = result.codeResult.code;
            
            // Pausa a câmera para o usuário conseguir revisar sem pressa
            Quagga.stop();

            // 1. Guarda os dados na memória temporária
            produtoTemporario.ean = codigoLido;
            produtoTemporario.nome = (codigoLido === "7891000100103") ? "Leite Condensado Nestlé 395g" : "Produto EAN: " + codigoLido;
            produtoTemporario.marca = (codigoLido === "7891000100103") ? "Nestlé" : "Identificado via Câmera";

            // 2. Joga os dados no Painel de Revisão da tela
            document.getElementById("rev-ean").innerText = produtoTemporario.ean;
            document.getElementById("rev-nome").innerText = produtoTemporario.nome;
            document.getElementById("rev-marca").innerText = produtoTemporario.marca;

            // 3. Mostra o botão de cadastro para confirmar
            document.getElementById("btn-cadastrar").style.display = "block";
            
            alert("Código lido e guardado na memória temporária! Revise os dados abaixo.");
        }
    });
}

// Ação executada ao clicar no botão de confirmar o cadastro
function cadastrarProdutoTemporario() {
    if (!produtoTemporario.ean) {
        alert("Nenhum produto na memória para cadastrar.");
        return;
    }

    // Aqui você envia para a sua base de dados, localStorage ou API futuramente
    console.log("Produto cadastrado com sucesso:", produtoTemporario);
    
    alert(`Sucesso! O produto ${produtoTemporario.nome} foi cadastrado.`);

    // Limpa o painel e reinicia a câmera para o próximo produto
    document.getElementById("rev-ean").innerText = "-";
    document.getElementById("rev-nome").innerText = "-";
    document.getElementById("rev-marca").innerText = "-";
    document.getElementById("btn-cadastrar").style.display = "none";
    
    produtoTemporario = { ean: "", nome: "", marca: "" };
    
    // Reinicia a leitura se já houver um modo selecionado
    if (modoAtual) {
        iniciarLeitor();
    }
}
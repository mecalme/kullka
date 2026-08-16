let modoAtual = "";
let aguardandoRevisao = false; // Impede travamentos da câmera

let produtoTemporario = {
    ean: "",
    nome: "",
    marca: ""
};

function setModo(modo) {
    modoAtual = modo;
    document.getElementById("modo-atual").innerHTML = `Modo selecionado: <b>${modo === 'recebimento' ? 'Recebimento Rampa' : 'Endereçar Box'}</b>`;
    
    // Inicia o leitor apenas se já não estiver rodando
    iniciarLeitor();
}

function iniciarLeitor() {
    // Evita inicializações duplicadas que deixam a tela preta
    try {
        Quagga.stop();
    } catch (e) {
        // Ignora se não houver instância ativa
    }

    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // Câmera traseira
            },
        },
        decoder : {
            readers : ["ean_reader", "ean_8_reader", "code_128_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error("Erro ao iniciar a câmera:", err);
            alert("Não foi possível acessar a câmera.");
            return;
        }
        Quagga.start();
        aguardandoRevisao = false;
        console.log("Câmera iniciada com segurança!");
    });

    // Evento de leitura contínua seguro
    Quagga.onDetected(function(result) {
        if (aguardandoRevisao) return; // Se já leu e aguarda cadastro, ignora novas leituras temporariamente

        if (result && result.codeResult && result.codeResult.code) {
            var codigoLido = result.codeResult.code;
            aguardandoRevisao = true; // Trava novas leituras para fixar os dados na tela

            // 1. Guarda os dados na memória temporária
            produtoTemporario.ean = codigoLido;
            produtoTemporario.nome = (codigoLido === "7891000100103") ? "Leite Condensado Nestlé 395g" : "Produto EAN: " + codigoLido;
            produtoTemporario.marca = (codigoLido === "7891000100103") ? "Nestlé" : "Identificado via Câmera";

            // 2. Joga os dados no Painel de Revisão
            document.getElementById("rev-ean").innerText = produtoTemporario.ean;
            document.getElementById("rev-nome").innerText = produtoTemporario.nome;
            document.getElementById("rev-marca").innerText = produtoTemporario.marca;

            // 3. Mostra o botão de cadastro
            document.getElementById("btn-cadastrar").style.display = "block";
            
            console.log("Produto guardado na memória temporária:", produtoTemporario);
        }
    });
}

// Ação ao clicar no botão de confirmar o cadastro
function cadastrarProdutoTemporario() {
    if (!produtoTemporario.ean) {
        alert("Nenhum produto na memória para cadastrar.");
        return;
    }

    console.log("Efetivando cadastro:", produtoTemporario);
    alert(`Sucesso! O produto ${produtoTemporario.nome} foi cadastrado.`);

    // Limpa o painel de revisão
    document.getElementById("rev-ean").innerText = "-";
    document.getElementById("rev-nome").innerText = "-";
    document.getElementById("rev-marca").innerText = "-";
    document.getElementById("btn-cadastrar").style.display = "none";
    
    // Reseta o objeto temporário
    produtoTemporario = { ean: "", nome: "", marca: "" };
    
    // Libera para ler novos produtos mantendo a câmera ativa (sem tela preta)
    aguardandoRevisao = false;
}
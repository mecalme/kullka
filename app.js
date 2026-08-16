function iniciarLeitorPrincipal() {
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
            console.warn("Aviso: Câmera não encontrada ou sem permissão. O leitor funcionará apenas via digitação/OCR.", err);
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

            let painel = document.getElementById("painel-revisao");
            painel.style.display = "block";
            
            document.getElementById("rev-ean").innerText = eanAtual;
            document.getElementById("input-nome").value = "Consultando produto...";
            document.getElementById("input-lote").value = "";
            document.getElementById("input-fabricacao").value = "";
            document.getElementById("input-validade").value = "";

            buscarProdutoNaInternet(eanAtual);
        }
    });
}
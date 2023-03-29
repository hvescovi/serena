// when the document is ready...
$(function () {

    $(document).on("click", "#btnIncluirQuestao", function () {

        // quem foi clicado
        var eu = $(this).attr('id');
        // obtém o id da questão
        //alert(eu);
        var idresp = eu.substring(4); // btpt15 => 15

        // obtém a resposta
        var resp = $("#pt" + idresp).val();

        // é preciso fornecer uma resposta!
        try {
            pontos = parseFloat(resp);
        }
        catch (e) {
            Swal.fire({
                icon: 'error',
                text: e
            })
            return false;
        }

        //variável para armazenar os dados
        var dados = "";

        // obter os dados
        var enunciado = $("#enunciado").val();
        var type = $("#type").val();
        if (type == "aberta") {
            var resposta = $("#resposta").val();
            dados = JSON.stringify({ type:type, enunciado: enunciado, resposta:resposta})
        }
        if (type == "completar") {
            var resposta = $("#resposta").val();
            dados = JSON.stringify({ type:type, enunciado: enunciado, lacunas:resposta})
        }

        if (type == "multiplaescolha_remodelada") {
            var resposta = $("#resposta").val();
            var alternativas = $("#alternativas").val().split("\n");
            let corretas = []
            let erradas = []
            for(var i = 0;i < alternativas.length;i++){
                let alt = alternativas[i];
                // alternativa correta?
                console.log(alt.substring(0, 4));
                if (alt.substring(0,4) == "===>") {
                    alt = alt.substring(4); // desconsidera a seta indicativa;
                    corretas.push({"op":alt});
                } else {
                    erradas.push({"op":alt});
                }
            }
            // prepara os dados :-)
            dados = JSON.stringify({ type:type, enunciado: enunciado, corrects:corretas, wrongs:erradas})            
        }

        //alert(dados);
        myip = $("#myip").text();

        $.ajax({
            url: 'http://' + myip + ':5000/incluir_questao',
            type: 'POST',
            dataType: 'json', // vou receber a resposta em json,
            data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
            contentType: "application/json",
            success: function (resultado) {
                var deu_certo = resultado.message == "ok";

                // diz que deu certo o envio
                if (deu_certo) {
                    //$("#final").text("Sua resposta foi enviada!");
                    Swal.fire("Questão incluída com sucesso!");
                } else {
                    Swal.fire(resultado.message + ":" + resultado.details);
                }

            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro:',
                    text: 'ocorreu algum erro na leitura dos dados, verifique o backend'
                });
            }
        });

    });


    

    function ajustaImagens(texto) {
        myip = $("#myip").text();
        url = 'http://' + myip + ':4999/imagem/';
        return texto.replace(/<img src=/gi, "<img src=" + url);
    }



    //$("#myip").text("192.168.15.8");
    //$("#myip").text("172.18.0.2");

    //alert(document.URL);
    if (document.URL.startsWith("http://")) {
        //try { // tenta execução via http
        url = document.URL;
        pos = url.search("/form_inserir_questao.html");
        if (pos > 0) {
            protocolo = "http://"
            http = protocolo.length;
            meuip = url.substring(http, pos);
            temdoisp = meuip.search(":");
            if (temdoisp > 0) {
                meuip = meuip.substring(0, temdoisp);
            }
            $("#myip").text(meuip);
        } else {
            alert("ERRO: não localizei URL");
        }
    } else {//catch(e) {
        // protocolo de arquivo - execução local
        $("#myip").text("localhost");
        Swal.fire({
            position: 'top-end',
            title: 'considerando protocolo de execução de arquivo (myip = localhost)',
            showConfirmButton: true,
            timer: 2500
        });
    }
    //$("#myip").text("k8master.blumenau.ifc.edu.br");

    // iniciar o círculo

    // qual elemento foi clicado
    //var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);

    var circulo = 1;
    // circulo 1 = turma 301
    // circulo 2 = turma 302

    $("#circulo_id").text(circulo);

    myip = $("#myip").text();
    /*
        
    
    */
    /*
        url = 'http://' + myip + ':5000/preparar_rodada/' + circulo;
    
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json', // vou receber a resposta em json,
            //data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
            //contentType: "application/json",
            success: function (resultado) {
                // coloca a resposta no gabarito
                $("#id_respondente").val(resultado.id);
                $("#nome_respondente").text(resultado.nome);
                $("#email_respondente").text(resultado.email);
                $("#questoes_respondidas").text(resultado.questoes_respondidas);
                // alert(resultado.details);
                //mostrar_resultado_acao(deu_certo);
    
                $("#nome_circulo").text(resultado.nome_circulo);
                $("#circulo_id").text(resultado.circulo_id);
                $("#data_circulo").text(resultado.data_circulo);
        
            },
            error: function () {
                alert("ocorreu algum erro na leitura dos dados do círculo, verifique o backend");
            }
    
        });
    */

});

$(document).on("click", "#btnListarRespostasSemPontuacao", function () {

    $(this).prop("disabled", true);

    myip = $("#myip").text();

    //alert('entrei');
    // pega o email de quem vai fazer a questão
    id_circulo = $("#id_circulo").val();

    url = 'http://' + myip + ':4999/exibir_respostas/'+id_circulo;

    //alert(url);
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (resultado) {

            $('#tabela_respostas').empty();
            //alert(resultado);
          
            if (resultado.message != "ok") {
                alert("Erro: "+resultado.details);
            } else {

                // sucesso, vamos abrir a questão...
                
                resps = resultado.details;

                ultima_questao_id = 0;

                
                
                for (i in resps) {

                    resp = resps[i];

                    cabecalho = '<div class="row"><div class="col shadow rounded wood">';
                
                    lin = cabecalho;

                    if (ultima_questao_id != resp.questao_id) { //mudou a questão?
                        // mostra a questão
                        lin += '<br>';
                        lin += '<div class="col"><b>'+ajustaImagens(resp.questao.enunciado)+"</b></col>";
                        lin += '</div>';
                        lin += cabecalho;
                        // atualiza a última questão
                        ultima_questao_id = resp.questao_id;
                    }

                    lin += '<div class="row"><div class="col shadow rounded wood">';
                    lin += '<div class="col">';
                    lin += resp.resposta;

                    // pontuação sugerida, entre 0 e 1
                    pt = "";
                    // gabarito de questão aberta ou lacunas, se houver
                    gabarito = "";

                    if (resp.questao.type == "MultiplaEscolha") {
                        
                        acertou = false;
                        for (j in resp.questao.alternativas) {
                            alt = resp.questao.alternativas[j];
                            if (alt.id == resp.resposta) {
                                acertou = alt.certa;
                                lin += " => " + alt.descricao;
                            }
                        }
                        if (acertou) {
                            lin += " !! ACERTOU !! ";
                            pt = 1;
                        } else {
                            lin += " _ errou _";
                            pt = 0;
                        }
                    } else if (resp.questao.type == "Aberta") {
                        gabarito = resp.questao.resposta;
                        if (gabarito == resp.resposta) {
                            pt = 1;
                        }
                    }
                    
                    lin += '<input type=text size="3" id="pt'+resp.id+'" value="'+pt+'">';
                    lin += ' <a id="lnkpt'+resp.id+'" class=".pontuar" href=#>pontuar</a>';
                    lin += ' GAB: '+ gabarito;

                    lin += "</div>"; //col
                    lin += "</div>"; //row

                    $('#tabela_respostas').append(lin);
                }
            }

        },
        error: function () {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });
});

$(document).on("click", ".responder_questao_circulo_aberta", function () {

    // qual botão foi clicado
    var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);
    var idq = eu.substring(1); // b23 = botão da questão 23

    // obtém a resposta
    var resp = $("#r" + idq).val();

    // é preciso fornecer uma resposta!
    if (resp.length < 3) {
        alert("forneça uma resposta!");
        return false;
    }

    // pegar dados do circulo
    id_circulo = $("#id_circulo").val();
    id_respondente = $("#id_respondente").val();

    //alert(resp);
    // prepara os dados em json
    var dados = JSON.stringify({ idq: idq, resposta: resp, id_respondente: id_respondente, id_circulo: id_circulo })

    //alert(dados);
    myip = $("#myip").text();

    $.ajax({
        url: 'http://' + myip + ':5000/responder_questao_circulo',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function (resultado) {
            var deu_certo = resultado.message == "ok";

            // diz que deu certo o envio
            if (deu_certo) {
                //$("#final").text("Sua resposta foi enviada!");
                alert("OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.");

                // volta ao começo
                $(location).attr('href', '/circulo.html');

            } else {
                alert(resultado.message + ":" + resultado.details);
            }

        },
        error: function () {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });

});

$(document).on("click", ".verificar_resposta_multipla_escolha", function () {

    // qual botão foi clicado
    var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);
    var idq = eu.substring(1); // b23 = botão da questão 23

    //alert(idq);
    // verifica a alternativa marcada
    var marcada = $('input[name=radiogrp' + idq + ']:checked').attr('id');

    // é preciso fornecer uma resposta!
    if (!marcada) {
        alert("escolha uma resposta!");
        return false;
    }

    var id_alternativa = marcada.substring(1); //r3 => 3
    //alert(id_alternativa);

    // pegar dados do circulo
    id_circulo = $("#id_circulo").val();
    id_respondente = $("#id_respondente").val();

    //alert(resp);
    // prepara os dados em json
    var dados = JSON.stringify({ idq: idq, resposta: id_alternativa, id_circulo: id_circulo, id_respondente: id_respondente })

    myip = $("#myip").text();
    $.ajax({
        url: 'http://' + myip + ':5000/responder_questao_circulo',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function (resultado) {
            var deu_certo = resultado.message == "ok";

            // diz que deu certo o envio
            if (deu_certo) {
                //$("#final").text("Sua resposta foi enviada!");
                alert("OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.");

                // volta ao começo
                $(location).attr('href', '/circulo.html');

            } else {
                alert(resultado.message + ":" + resultado.details);
            }
        },
        error: function () {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });

});

$(document).on("click", ".verificar_resposta_completar", function () {

    // qual botão foi clicado
    var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);
    var idq = eu.substring(1); // b23 = botão da questão 23
    // verifica a alternativa marcada

    // quantas lacunas existem?
    n = $('#lacunas' + idq).val();

    // pegar os valores informados
    valores = '';

    // percorrer os campos dos valores
    for (var lac = 0; lac < n; lac++) {
        v = $("#q" + idq + "l" + lac).val();

        // é preciso fornecer uma resposta!
        if (v.length <= 0) {
            alert("preencha todas as lacunas!");
            return false;
        }

        valores = valores + v;
        // ainda não é o último valor?
        if (lac < n - 1) {
            // adicionar o separado
            valores = valores + "|";
        }
    }

    //alert(valores);

    // pegar dados do circulo
    id_circulo = $("#id_circulo").val();
    id_respondente = $("#id_respondente").val();

    // prepara os dados em json
    var dados = JSON.stringify({ idq: idq, resposta: valores, id_circulo: id_circulo, id_respondente: id_respondente })

    myip = $("#myip").text();
    $.ajax({
        url: 'http://' + myip + ':5000/responder_questao_circulo',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function (resultado) {
            var deu_certo = resultado.message == "ok";

            // diz que deu certo o envio
            if (deu_certo) {
                //$("#final").text("Sua resposta foi enviada!");
                alert("OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.");

                // volta ao começo
                $(location).attr('href', '/circulo.html');

            } else {
                alert(resultado.message + ":" + resultado.details);
            }

        },
        error: function () {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
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

// when the document is ready...
$(function () {
    //alert(document.URL);
    if (document.URL.startsWith("http://localhost")) {
        $("#myip").text("localhost");
    } else if (document.URL.startsWith("http://k8master")) {
        $("#myip").text("k8master.blumenau.ifc.edu.br");
    } else {
        url = document.URL;
        pos = url.search("/circulo.html");
        if (pos > 0) {
            protocolo = "http://"
            http = protocolo.length;
            meuip = url.substring(http, pos);
            $("#myip").text(meuip);
        } else {
            alert("ERRO: não localizei URL");
        }
    }
    //$("#myip").text("k8master.blumenau.ifc.edu.br");

    // iniciar o círculo

    // qual elemento foi clicado
    //var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);

    var circulo = 2;
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
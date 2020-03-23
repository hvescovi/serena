$(document).on("click", "#btn_abrir_questao_circulo", function() {

    $(this).prop("disabled", true);

    myip = $("#myip").text();

    //alert('entrei');
    // pega o email de quem vai fazer a questão
    id_respondente = $("#id_respondente").val();
    id_circulo = $("#id_circulo").val();

    url = 'http://' + myip + ':5000/abrir_questao_circulo/' + id_circulo + '/' + id_respondente;

    //alert(url);
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(resultado) {

            $('#tabela_questoes').empty();
            //alert(resultado);

            quest = resultado;
            idq = quest.id;
            lin = '<div class="row"><div class="col shadow p-3 mb-4 rounded wood">';

            //alert(url);

            if (quest.type == "Aberta") {
                lin = lin + quest.enunciado; // + "(" + quest[i].type + ")"
                lin = lin + "<br>"
                lin = lin + "Sua resposta: <input type=text id=r" + idq + ">";
                lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm responder_questao_circulo_aberta">enviar resposta</button>';

                // contador de respostas
                lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
            }

            if (quest.type == "MultiplaEscolha") {
                lin = lin + quest.enunciado; // + "(" + quest[i].type + ")"
                lin = lin + "<br>"
                for (var j in quest.alternativas) {
                    lin = lin + '<input type=radio name="radiogrp' + idq + '" id="r' + quest.alternativas[j].id + '">' + quest.alternativas[j].descricao + "<br/>";
                }
                lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_multipla_escolha">verificar resposta</button>';

                // contador de respostas
                lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
            }

            if (quest.type == "Completar") {
                // quebrar o enunciado em partes sepadas por três underlines
                partes = quest.enunciado.split("___");
                n = partes.length;
                en = "";
                for (var lac = 0; lac < n; lac++) {
                    // acrescentar o texto antes da lacuna
                    en = en + partes[lac];
                    // ainda não é a última parte de texto?
                    if (lac < (n - 1)) {
                        // acrescentar o campo de entrada da lacuna
                        en = en + '<input type=text id="q' + idq + 'l' + lac + '">';
                    }
                }

                // acrescentar campo escondido para controle do número de lacunas
                // se são 3 partes de texto, então são 2 lacunas
                lin = lin + '<input type=hidden id="lacunas' + idq + '" value="' + (n - 1) + '">';

                // acrescentar o enunciado da questão de lacuna, com as lacunas (caixas de texto)
                lin = lin + en;
                lin = lin + "<br>";

                lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_completar">verificar resposta(s)</button>';

                // contador de respostas
                lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
            }

            lin = lin + "</div></div>";
            //for (var j in quest[i].alternativas) {
            //    lin = lin + "<br> => " + quest[i].alternativas[j].descricao;
            // }
            $('#tabela_questoes').append(lin);
            //alert(lin);

        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });
});

$(document).on("click", ".responder_questao_circulo_aberta", function() {

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
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";

            // diz que deu certo o envio
            if (deu_certo) {
                //$("#final").text("Sua resposta foi enviada!");
                alert("OBRIGADO! Sua resposta foi enviada.");

                // volta ao começo
                $(location).attr('href', '/circulo.html');

            } else {
                alert(resultado.message + ":" + resultado.details);
            }

        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });

});

$(document).on("click", ".verificar_resposta_multipla_escolha", function() {

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

    var id_alternativa = marcada[1]; //r3 => 3
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
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";

            // diz que deu certo o envio
            if (deu_certo) {
                //$("#final").text("Sua resposta foi enviada!");
                alert("OBRIGADO! Sua resposta foi enviada.");

                // volta ao começo
                $(location).attr('href', '/circulo.html');

            } else {
                alert(resultado.message + ":" + resultado.details);
            }
        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });

});

$(document).on("click", ".verificar_resposta_completar", function() {

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
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";

            // diz que deu certo o envio
            if (deu_certo) {
                //$("#final").text("Sua resposta foi enviada!");
                alert("OBRIGADO! Sua resposta foi enviada.");

                // volta ao começo
                $(location).attr('href', '/circulo.html');

            } else {
                alert(resultado.message + ":" + resultado.details);
            }

        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });

});


$(document).on("click", ".retornar_contagem_respostas_questao", function() {

    // qual elemento foi clicado
    var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);
    var idq = eu.substring(4); // cont23 = contador de respostas da questão 23

    myip = $("#myip").text();
    url = 'http://' + myip + ':5000/retornar_contagem_respostas_questao/' + $.session.get("user_email") + "/" + idq;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json', // vou receber a resposta em json,
        //data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function(resultado) {
            // coloca a resposta no gabarito
            $("#cont" + idq).text(resultado);
            // alert(resultado.details);
            //mostrar_resultado_acao(deu_certo);

        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados de contagem, verifique o backend");
        }

    });
});



//$("#myip").text("192.168.15.8");
//$("#myip").text("172.18.0.2");

// when the document is ready...
$(function() {
    //alert(document.URL);
    if (document.URL.startsWith("http://localhost")) {
        $("#myip").text("localhost");
    } else if (document.URL.startsWith("http://k8master")) {
        $("#myip").text("k8master.blumenau.ifc.edu.br");
    }
    //$("#myip").text("k8master.blumenau.ifc.edu.br");

    // iniciar o círculo

    // qual elemento foi clicado
    var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);

    myip = $("#myip").text();

    url = 'http://' + myip + ':5000/preparar_rodada/1';

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json', // vou receber a resposta em json,
        //data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function(resultado) {
            // coloca a resposta no gabarito
            $("#id_respondente").val(resultado.id);
            $("#nome_respondente").text(resultado.nome);
            $("#email_respondente").text(resultado.email);
            // alert(resultado.details);
            //mostrar_resultado_acao(deu_certo);

        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados de contagem, verifique o backend");
        }

    });

});
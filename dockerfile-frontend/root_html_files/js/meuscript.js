$(document).on("click", "#btn_listar_questoes", function() {
    myip = $("#myip").text();

    url = 'http://' + myip + ':5000/retornar_questoes';
    //alert($('#naofeitas').prop('checked'));
    if ($('#naofeitas').prop('checked')) {
        url = url + "/naofeitas/" + $.session.get("user_email");
    }

    //alert(">" + myip + "<");
    //alert(url);
    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(resultado) {
            $('#tabela_questoes').empty();
            //alert(resultado);
            quest = resultado;
            for (var i in quest) { //i vale a posição no vetor
                idq = quest[i].id;
                lin = '<div class="row"><div class="col shadow p-3 mb-4 rounded wood">';

                //alert(url);

                if (quest[i].type == "Aberta") {
                    lin = lin + ajustaImagens(quest[i].enunciado); // + "(" + quest[i].type + ")"
                    lin = lin + "<br>"
                    lin = lin + "Sua resposta: <input type=text id=r" + idq + ">";
                    lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_aberta">verificar resposta</button>';

                    // contador de respostas
                    lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                    lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
                }

                if (quest[i].type == "MultiplaEscolha") {
                    lin = lin + ajustaImagens(quest[i].enunciado); // + "(" + quest[i].type + ")"
                    lin = lin + "<br>"

                    // embaralhar as alernativas
                    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
                    quest[i].alternativas.sort(() => Math.random() - 0.5);

                    for (var j in quest[i].alternativas) {
                        lin = lin + '<input type=radio name="radiogrp' + idq + '" id="r' + quest[i].alternativas[j].id + '">' + ajustaImagens(quest[i].alternativas[j].descricao) + "<br/>";
                    }
                    lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_multipla_escolha">verificar resposta</button>';

                    // contador de respostas
                    lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                    lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
                }

                if (quest[i].type == "Completar") {
                    // quebrar o enunciado em partes sepadas por três underlines
                    partes = quest[i].enunciado.split("___");
                    n = partes.length;
                    en = "";
                    for (var lac = 0; lac < n; lac++) {
                        // acrescentar o texto antes da lacuna
                        en = en + ajustaImagens(partes[lac]);
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
            }
        },
        error: function() {
            alert("ocorreu algum erro na leitura dos dados, verifique o backend");
        }
    });
});

$(document).on("click", ".verificar_resposta_aberta", function() {

    // qual botão foi clicado
    var eu = $(this).attr('id');
    // obtém o id da questão
    //alert(eu);
    var idq = eu.substring(1); // b23 = botão da questão 23

    // obtém a resposta
    //alert(idq);
    var resp = $("#r" + idq).val();

    // é preciso fornecer uma resposta!
    if (resp.length < 3) {
        alert("forneça uma resposta!");
        return false;
    }

    var user_name = $.session.get("user_name");
    var user_email = $.session.get("user_email");
    var token = $.session.get("token");

    alert(token);
    // prepara os dados em json
    var dados = JSON.stringify({ idq: idq, resposta: resp, user_name: user_name, user_email: user_email, token: token })

    myip = $("#myip").text();
    $.ajax({
        url: 'http://' + myip + ':5000/verificar_resposta_aberta',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";

            // coloca a resposta no gabarito
            $("#g" + idq).text(resultado.details);
            // alert(resultado.details);
            //mostrar_resultado_acao(deu_certo);
            if (!deu_certo) {
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

    var user_name = $.session.get("user_name");
    var user_email = $.session.get("user_email");

    //alert(resp);
    // prepara os dados em json
    var dados = JSON.stringify({ idq: idq, alternativa: id_alternativa, user_name: user_name, user_email: user_email })

    myip = $("#myip").text();
    $.ajax({
        url: 'http://' + myip + ':5000/verificar_resposta_multipla_escolha',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";

            // coloca a resposta no gabarito
            $("#g" + idq).text(resultado.details);
            // alert(resultado.details);
            //mostrar_resultado_acao(deu_certo);
            if (!deu_certo) {
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

    var user_name = $.session.get("user_name");
    var user_email = $.session.get("user_email");

    // prepara os dados em json
    var dados = JSON.stringify({ idq: idq, lacunas: valores, user_name: user_name, user_email: user_email })

    myip = $("#myip").text();
    $.ajax({
        url: 'http://' + myip + ':5000/verificar_resposta_completar',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";

            // coloca a resposta no gabarito
            $("#g" + idq).text(resultado.details);
            // alert(resultado.details);
            //mostrar_resultado_acao(deu_certo);
            if (!deu_certo) {
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


function ajustaImagens(texto) {
    myip = $("#myip").text();
    url = 'http://' + myip + ':5000/imagem/';
    return texto.replace(/<img src=/gi, "<img src=" + url);
}

function onSignIn(googleUser) {

    var profile = googleUser.getBasicProfile();
    //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    //console.log('Name: ' + profile.getName());
    //console.log('Image URL: ' + profile.getImageUrl());
    //console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    var email = profile.getEmail();
    var nome = profile.getName();
    var foto = profile.getImageUrl();

    $("#user_name").text(nome);
    $("#user_email").text(email);

    // https://ciphertrick.com/session-handling-using-jquery/
    // guarda na sessão
    $.session.set("user_name", nome);
    $.session.set("user_email", email);

    // guardar token
    var token = googleUser.getAuthResponse().id_token;
    $.session.set("token", token);

    // grava token no backend
    myip = $("#myip").text();
    // verificar se o link da foto muda a cada login ou época
    url = 'http://' + myip + ':5000/salvar_token'

    var dados = JSON.stringify({ identificador: foto, token: token })

    myip = $("#myip").text();
    $.ajax({
        url: 'http://' + myip + ':5000/salvar_token',
        type: 'POST',
        dataType: 'json', // vou receber a resposta em json,
        data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
        //contentType: "application/json",
        success: function(resultado) {
            var deu_certo = resultado.message == "ok";
        },
        error: function() {
            alert("ocorreu algum erro ao salvar token no backend");
        }
    });

    // coloca a foto na tela
    $("#foto").html("<img src='" + foto + "' heigth='80' alt='foto'>");
    $("#meu_nome").html("<b>" + nome + "</b>");
}

// when the document is ready...
$(function() {
    if (document.URL.startsWith("http://localhost")) {
        $("#myip").text("localhost");
    } else if (document.URL.startsWith("http://k8master")) {
        $("#myip").text("k8master.blumenau.ifc.edu.br");
    }
});
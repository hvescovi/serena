
//$("#myip").text("192.168.15.8");
//$("#myip").text("172.18.0.2");

// when the document is ready...
$(function () {

    // definições reusáveis neste código
    // *********************************

    function jmessage(tipo, mensagem) {

        // tenta usar biblioteca Swal  

        /*
        try {
            if (tipo == "ERRO") {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro:',
                    text: mensagem
                });
            } else {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: mensagem,
                    showConfirmButton: true,
                    timer: 2500
                });
            }
        } catch (error) {
          */
        // se der erro, mostra alert simples
        alert(mensagem);
        //}
    }

    var HTML_carregando = ' <img src="images/carregando.gif" id="carregando" height="30" class="d-none">';

    function manipular_carregando(show_hide) {
        if (show_hide == "show") {
            $("#carregando").removeClass("d-none");
        } else {
            $("#carregando").addClass("d-none");
        }
    }


    // início dos eventos
    // ******************


    $(document).on("click", "#btn_abrir_questao_circulo", function () {


        $(this).prop("disabled", true);

        myip = $("#myip").text();

        //alert('entrei');
        // pega o email de quem vai fazer a questão
        id_respondente = $("#id_respondente").val();
        circulo_id = $("#circulo_id").text(); // está em um spam, aparecendo na tela

        url = 'http://' + myip + ':5000/abrir_questao_circulo/' + circulo_id + '/' + id_respondente;

        //alert(url);
        //console.log('abrir_questao_circulo -> url:', url, { myip: myip, circulo_id: circulo_id, id_respondente: id_respondente });
        //console.log("início do clique abrir questão");
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (resultado) {

               // console.log("entrei no sucesso do abrir questão");
                $('#tabela_questoes').empty();
                //alert(resultado);

                if (resultado.message != "ok") {
                    //jmessage("ERRO", resultado.details);
                    alert("ERRO", resultado.details);
                } else {

                    //console.log("abrir questão ok");
                    // sucesso, vamos abrir a questão...

                    quest = resultado.details;
                    idq = quest.id;
                    lin = '<div class="row"><div class="col shadow p-3 mb-4 rounded wood"><font size="+2">';

                    //alert(url);

                    if (quest.type == "aberta") {
                        //alert('questão: '+quest.enunciado);
                        enun = quest.enunciado;
                        novo = enun.replace(/\n/g, "<br>");
                        //lin = lin + ajustaImagens(quest.enunciado); // + "(" + quest[i].type + ")"
                        lin = lin + ajustaImagens(novo); // + "(" + quest[i].type + ")"

                        lin = lin + "<br>"
                        //lin = lin + "Sua resposta: <input type=text id=r" + idq + ">";
                        lin = lin + "Your answer: <textarea id=r" + idq + "></textarea> <br>";
                        lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm responder_questao_circulo_aberta" onclick="return false">send answer</button>';

                        lin = lin + HTML_carregando;

                        // contador de respostas
                        //lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                        lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito

                        lin += "</font>";
                    }

                    if (quest.type == "multiplaescolha") {
                        lin = lin + ajustaImagens(quest.enunciado); // + "(" + quest[i].type + ")"
                        lin = lin + "<br>"


                        // embaralhar as alernativas
                        // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
                        quest.alternativas.sort(() => Math.random() - 0.5);

                        for (var j in quest.alternativas) {
                            lin = lin + '<hr><input type=radio name="radiogrp' + idq + '" id="r' + quest.alternativas[j].id + '"> ' + ajustaImagens(quest.alternativas[j].descricao) + "<br/>";
                        }
                        lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_multipla_escolha">send answer</button>';

                        lin = lin + HTML_carregando; //'<img src="images/carregando.gif" id="esperando" height="25">'; // class="d-none">';

                        // contador de respostas
                        //lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

                        lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
                    }

                    if (quest.type == "completar") {
                        // quebrar o enunciado em partes sepadas por três underlines
                        partes = quest.enunciado.split("___");
                        n = partes.length;
                        en = "";
                        for (var lac = 0; lac < n; lac++) {
                            // acrescentar o texto antes da lacuna
                            en = en + ajustaImagens(partes[lac]);
                            // ainda não é a última parte de texto?
                            if (lac < (n - 1)) {
                                // acrescentar o campo de entrada da lacuna
                                // não completar valores, para não pegar respostas anteriores
                                en = en + '<input autocomplete="off" type=text id="q' + idq + 'l' + lac + '">';
                            }
                        }

                        // acrescentar campo escondido para controle do número de lacunas
                        // se são 3 partes de texto, então são 2 lacunas
                        lin = lin + '<input type=hidden id="lacunas' + idq + '" value="' + (n - 1) + '">';

                        // acrescentar o enunciado da questão de lacuna, com as lacunas (caixas de texto)
                        lin = lin + en;
                        lin = lin + "<br>";

                        lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_completar">send answer</button>';

                        lin = lin + HTML_carregando;

                        // contador de respostas
                        //lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';

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
            error: function () {
                jmessage("ERRO", "ocorreu algum erro na leitura dos dados, verifique o backend");
            }
        });
        //console.log("fim do clique abrir questão");
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
        if (resp.length < 1) {
            jmessage("ERRO", "forneça um resposta!");
            return false;
        }

        // pegar dados do circulo
        circulo_id = $("#circulo_id").text();
        id_respondente = $("#id_respondente").val();

        //alert(resp);
        // prepara os dados em json
        var dados = JSON.stringify({ idq: idq, resposta: resp, id_respondente: id_respondente, id_circulo: circulo_id })

        //alert(dados);
        myip = $("#myip").text();

        // confirma se quer mesmo responder
        var confirma = confirm("Confirma o envio de sua resposta?");
        if (confirma == true) {

            // só desabilita após as condições de sucesso ok
            // desabilitar o botão da resposta, após o clique ter ocorrido
            // evitar múltiplos cliques que n-plicam as respostas
            // implementado em tempo de aplicação da prova
            // André respondeu 48 questões :-o

            $("#" + eu).prop("disabled", true);
            manipular_carregando("show");

            $.ajax({
                url: 'http://' + myip + ':5000/responder_questao_circulo',
                type: 'POST',
                dataType: 'json', // vou receber a resposta em json,
                data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
                //contentType: "application/json",
                success: function (resultado) {

                    manipular_carregando("hide");

                    var deu_certo = resultado.message == "ok";

                    // diz que deu certo o envio
                    if (deu_certo) {
                        //$("#final").html("<h5>Sua resposta está sendo enviada, aguarde até aparecer o ALERT de confirmação.</h5>");

                        manipular_carregando("hide");
                        jmessage("OK", "OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.");

                        // volta ao começo
                        $(location).attr('href', '/circulo.html');

                    } else {
                        jmessage("ERRO", resultado.details);
                    }

                },
                error: function () {
                    manipular_carregando("hide");
                    jmessage("ERRO", 'ocorreu algum erro na leitura dos dados, verifique o backend');
                }
            });

        }

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
            jmessage("ERRO", 'escolha uma resposta!');
            return false;
        }

        var id_alternativa = marcada.substring(1); //r3 => 3
        //alert(id_alternativa);

        // pegar dados do circulo
        circulo_id = $("#circulo_id").text();
        id_respondente = $("#id_respondente").val();

        //alert(resp);
        // prepara os dados em json
        var dados = JSON.stringify({ idq: idq, resposta: id_alternativa, id_circulo: circulo_id, id_respondente: id_respondente })

        myip = $("#myip").text();

        //alert("AQUI VAMOS NÓS");

        // confirma se quer mesmo responder
        var confirma = confirm("Confirma o envio de sua resposta?");
        if (confirma == true) {

            // desabilita o botão de resposta
            $("#" + eu).prop("disabled", true);
            manipular_carregando("show");

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
                        manipular_carregando("hide");
                        jmessage("ok", "OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.");

                        // volta ao começo
                        $(location).attr('href', '/circulo.html');

                    } else {
                        manipular_carregando("hide");
                        jmessage("ERRO", resultado.details);
                    }
                },
                error: function () {
                    manipular_carregando("hide");
                    jmessage("ERRO", 'ocorreu algum erro na leitura dos dados, verifique o backend');
                }
            });
        }

    });

    $(document).on("click", ".verificar_resposta_completar", function (event) {

        event.preventDefault();

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
                jmessage("ERRO", 'preencha todas as lacunas');
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
        circulo_id = $("#circulo_id").text();
        id_respondente = $("#id_respondente").val();

        // prepara os dados em json
        var dados = JSON.stringify({ idq: idq, resposta: valores, id_circulo: circulo_id, id_respondente: id_respondente })

        myip = $("#myip").text();

        // confirma se quer mesmo responder
        var confirma = confirm("Confirma o envio de sua resposta?");
        if (confirma == true) {


            $("#" + eu).prop("disabled", true);
            manipular_carregando("show");

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
                        manipular_carregando("hide");
                        jmessage("OK", "OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.");

                        // volta ao começo
                        $(location).attr('href', '/circulo.html');

                    } else {
                        manipular_carregando("hide");
                        jmessage("ERRO", resultado.details);
                    }

                },
                error: function () {
                    manipular_carregando("hide");
                    jmessage("ERRO", 'ocorreu algum erro na leitura dos dados, verifique o backend');
                }
            });

        } // fim if confirma responder

    });

    function ajustaImagens(texto) {
        myip = $("#myip").text();
        url = 'http://' + myip + ':5000/imagem/';
        return texto.replace(/<img src=/gi, "<img src=" + url);
    }

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
            temdoisp = meuip.search(":");
            if (temdoisp > 0) {
                meuip = meuip.substring(0, temdoisp);
            }
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








    myip = $("#myip").text();

    // obtém do backend qual é o círculo ativo
    url = 'http://' + myip + ':5000/circulo_ativo';

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (resultado) {

            if (resultado.message == "ok") {
                circulo = resultado.details.id;
                console.log("circulo ativo: " + circulo);

                // busca reopondente fixo
                var id_quem_responde = sessionStorage.getItem("id_quem_responde");

                // se NÃO escolheu o respondente...
                if ( id_quem_responde == null ) {
                    // vamos preparar a rodada via sorteio (círculo)
                    url = 'http://' + myip + ':5000/preparar_rodada/' + circulo + '/0';
                } else {
                    // vamos preparar a rodada via linha (prova)
                    url = 'http://' + myip + ':5000/preparar_rodada/' + circulo + '/' + id_quem_responde;
                }

                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json', // vou receber a resposta em json,
                    //data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
                    //contentType: "application/json",
                    success: function (resultado) {
                        if (resultado.message == "ok") {
                            d = resultado.details;
                            // coloca a resposta no gabarito
                            $("#id_respondente").val(d.id);
                            $("#nome_respondente").text(d.nome);
                            $("#email_respondente").text(d.email);
                            $("#questoes_respondidas").text(d.questoes_respondidas);
                            $("#questoes_puladas").text(d.questoes_puladas);
                            // alert(resultado.details);
                            //mostrar_resultado_acao(deu_certo);

                            $("#nome_circulo").text(d.nome_circulo);
                            $("#circulo_id").text(d.circulo_id);
                            $("#data_circulo").text(d.data_circulo);
                        }
                        else {
                            jmessage("ERRO", resultado.details);
                        }
                    },
                    error: function () {
                        jmessage("ERRO", 'ocorreu algum erro na leitura dos dados, verifique o backend');
                    }

                });

            } else {
                jmessage("ERRO", "Não foi possível encontrar círculo ativo: " + resultado.details);
            }
        },
        error: function () {
            jmessage("ERRO", "Erro na leitura dos dados, verifique o backend");
        }
    });






    $(document).on("click", "#btnPassarVez", function () {
        window.location.reload();
    });
});
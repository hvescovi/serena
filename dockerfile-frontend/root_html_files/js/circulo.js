
//$("#myip").text("192.168.15.8");
//$("#myip").text("172.18.0.2");

// when the document is ready...
$(function () {

    $(document).on("click", "#btn_abrir_questao_circulo", function () {

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
            success: function (resultado) {
    
                $('#tabela_questoes').empty();
                //alert(resultado);
              
                if (resultado.message != "ok") {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro:',
                        text: resultado.details
                    })
                } else {
    
                    // sucesso, vamos abrir a questão...
                    
                    quest = resultado.details;
                    idq = quest.id;
                    lin = '<div class="row"><div class="col shadow p-3 mb-4 rounded wood">';
    
                    //alert(url);
    
                    if (quest.type == "Aberta") {
                        lin = lin + ajustaImagens(quest.enunciado); // + "(" + quest[i].type + ")"
                        lin = lin + "<br>"
                        //lin = lin + "Sua resposta: <input type=text id=r" + idq + ">";
                        lin = lin + "Sua resposta: <textarea id=r" + idq + "></textarea> <br>";
                        lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm responder_questao_circulo_aberta">enviar resposta</button>';
    
                        // contador de respostas
                        //lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';
    
                        lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
                    }
    
                    if (quest.type == "MultiplaEscolha") {
                        lin = lin + ajustaImagens(quest.enunciado); // + "(" + quest[i].type + ")"
                        lin = lin + "<br>"
    
    
                        // embaralhar as alernativas
                        // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
                        quest.alternativas.sort(() => Math.random() - 0.5);
    
                        for (var j in quest.alternativas) {
                            lin = lin + '<input type=radio name="radiogrp' + idq + '" id="r' + quest.alternativas[j].id + '">' + ajustaImagens(quest.alternativas[j].descricao) + "<br/>";
                        }
                        lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_multipla_escolha">salvar resposta</button>';
    
                        // contador de respostas
                        //lin = lin + '<span class="badge badge-success m-1 retornar_contagem_respostas_questao" id="cont' + idq + '">?</span>';
    
                        lin = lin + '<br><div id="g' + idq + '" class="bg-warning"></div>'; // espaço para o gabarito
                    }
    
                    if (quest.type == "Completar") {
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
                                en = en + '<input type=text id="q' + idq + 'l' + lac + '">';
                            }
                        }
    
                        // acrescentar campo escondido para controle do número de lacunas
                        // se são 3 partes de texto, então são 2 lacunas
                        lin = lin + '<input type=hidden id="lacunas' + idq + '" value="' + (n - 1) + '">';
    
                        // acrescentar o enunciado da questão de lacuna, com as lacunas (caixas de texto)
                        lin = lin + en;
                        lin = lin + "<br>";
    
                        lin = lin + '<button id="b' + idq + '" class="btn btn-primary btn-sm verificar_resposta_completar">salvar resposta</button>';
    
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
                Swal.fire({
                    icon: 'error',
                    title: 'Erro:',
                    text: 'ocorreu algum erro na leitura dos dados, verifique o backend'
                });
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
        if (resp.length < 1) {
            Swal.fire({
                icon: 'error',
                text: 'forneça um resposta!'
            })
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
    
        // só desabilita após as condições de sucesso ok
        // desabilitar o botão da resposta, após o clique ter ocorrido
        // evitar múltiplos cliques que n-plicam as respostas
        // implementado em tempo de aplicação da prova
        // André respondeu 48 questões :-o
        $("#"+eu).prop("disabled",true);
    
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
                    $("#final").html("<h5>Sua resposta está sendo enviada, aguarde até aparecer o ALERT de confirmação.</h5>");
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.',
                        showConfirmButton: true,
                        timer: 3000
                    });
                    
                    // volta ao começo
                    $(location).attr('href', '/circulo.html');
    
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
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.',
                        showConfirmButton: true,
                        timer: 3000
                    });
    
                    // volta ao começo
                    $(location).attr('href', '/circulo.html');
    
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
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'OBRIGADO! Sua resposta foi enviada. Clique em OK e quando aparecer o nome da próxima pessoa, chame-a para responder.',
                        showConfirmButton: true,
                        timer: 3000
                    });
    
                    // volta ao começo
                    $(location).attr('href', '/circulo.html');
    
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

    myip = $("#myip").text();
    /*
        
    
    */

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
            $("#questoes_puladas").text(resultado.questoes_puladas);
            // alert(resultado.details);
            //mostrar_resultado_acao(deu_certo);

            $("#nome_circulo").text(resultado.nome_circulo);
            $("#circulo_id").text(resultado.circulo_id);
            $("#data_circulo").text(resultado.data_circulo);
    
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Erro:',
                text: 'ocorreu algum erro na leitura dos dados, verifique o backend'
            });
        }

    });


    $(document).on("click", "#btnPassarVez", function () {
        window.location.reload();
    });
});
// when the document is ready...
$(function () {

    $(document).on("click", "#btnListarRespostasSemPontuacao", function () {

        $(this).prop("disabled", true);

        myip = $("#myip").text();

        //alert('entrei');
        id_circulo = $("#circulo_id").text();

        url = 'http://' + myip + ':4999/exibir_respostas/' + id_circulo;

        //alert(url);
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (resultado) {

                $('#tabela_respostas').empty();
                //alert(resultado);

                if (resultado.message != "ok") {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro: ',
                        text: resultado.details
                    });
                } else {

                    // sucesso, vamos abrir a questão...

                    resps = resultado.details;

                    ultima_questao_id = 0;

                    // mostra o gabarito quando mostrar o cabeçalho de uma nova questão
                    mostrar_gabarito = false;

                    cabecalho = '<div class="row"><div class="col border border-info rounded wood">';

                    for (i in resps) {

                        // pega a resposta atual como objeto javascript
                        resp = resps[i];

                        lin = "";

                        if (ultima_questao_id != resp.questao_id) { //vai ser exibida uma nova questão?
                            // mostra a questão
                            lin += '<div class="row"><div class="col border border-danger rounded mt-4">';
                            lin += '<b>' + ajustaImagens(resp.questao.enunciado) + "</b>";
                            lin += '</div>'; //col
                            lin += '</div>'; //row

                            // atualiza a última questão
                            ultima_questao_id = resp.questao_id;
                            // precisa mostrar o gabarito
                            mostrar_gabarito = true;
                        }

                        // nova linha
                        novaresp = cabecalho;

                        novaresp += resp.resposta;

                        // aparencia da pontuação (tem destaque se ainda não foi corrigida)
                        aparencia = "";

                        // gabarito padrão
                        gabarito = "";

                        // se já houver nota, vai aparecer apenas a sugestão ao lado
                        sugerido = "";

                        if (resp.pontuacao == null) { // não tem pontuação ainda?
                            // pontuação sugerida, entre 0 e 1
                            pt = "";

                            if (resp.questao.type == "MultiplaEscolha") {

                                acertou = false;
                                for (j in resp.questao.alternativas) {
                                    alt = resp.questao.alternativas[j];
                                    if (alt.id == resp.resposta) {
                                        acertou = alt.certa;
                                        novaresp += " => " + alt.descricao;
                                    }
                                }
                                if (acertou) {
                                    novaresp += " !! ACERTOU !! ";
                                    pt = 1;
                                } else {
                                    novaresp += " _ errou _";
                                    pt = 0;
                                }
                            } else if (resp.questao.type == "Aberta") {
                                gabarito = resp.questao.resposta;
                                pt = resp.pontuacao_sugerida;
                            } else if (resp.questao.type == "Completar") {
                                gabarito = resp.questao.lacunas;
                                pt = resp.pontuacao_sugerida;
                            }
                            aparencia = ' class = "bg-warning" ';
                        } else {
                            pt = resp.pontuacao;
                            sugerido = '<span id="sugerido"' + resp.id + '"class="bg-info" title="pontuação sugerida">' + resp.pontuacao_sugerida + '</span>';
                        }

                        novaresp += '<input type="text" ' + aparencia + ' size="3" id="pt' + resp.id + '" value="' + pt + '">';
                        novaresp += ' <button id="btpt' + resp.id + '" class="pontuar_resposta">pontuar</button> ' + sugerido;
                        novaresp += ' <img src="images/check-circle.svg" id="corrigida' + resp.id + '" class="d-none">';

                        novaresp += "</div>"; //col
                        novaresp += "</div>"; //row

                        // antes de mostrar a nova resposta: precisa mostrar gabarito?
                        if (mostrar_gabarito) {
                            lin += '<div class="row"><div class="col border border-warning bg-warning">';
                            lin += '<h5 class="bg-info">GABARITO</h5>' + gabarito;
                            lin += '</div></div>'; //col e row
                            mostrar_gabarito = false;
                        }

                        // acrescenta a resposta
                        lin += novaresp;

                        $('#tabela_respostas').append(lin);
                    }
                }

            },
            error: function () {
                Swal.Fire({
                    icon: 'error',
                    title: 'Erro:',
                    text: 'ocorreu algum erro na leitura dos dados, verifique o backend'
                });
            }
        });
    });

    $(document).on("click", ".vai", function () {
        alert("foi");
        // OBS: na classe do elemento HTML é só class="vai" e não class=".vai" !!!!!!!!!!!
    });


    $(document).on("click", ".pontuar_resposta", function () {

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

        //alert(resp);
        // prepara os dados em json
        var dados = JSON.stringify({ id: idresp, pontuacao: resp })

        //alert(dados);
        myip = $("#myip").text();

        $.ajax({
            url: 'http://' + myip + ':4999/pontuar_resposta',
            type: 'POST',
            dataType: 'json', // vou receber a resposta em json,
            data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
            //contentType: "application/json",
            success: function (resultado) {
                var deu_certo = resultado.message == "ok";

                // diz que deu certo o envio
                if (deu_certo) {
                    //$("#final").text("Sua resposta foi enviada!");
                    $("#corrigida" + idresp).removeClass("d-none");
                    $("#pt" + idresp).prop('disabled', true);
                } else {
                    Swal.fire(resultado.message + ":" + resultado.details);
                }

            },
            error: function () {
                Swal.Fire({
                    icon: 'error',
                    title: 'Erro:',
                    text: 'ocorreu algum erro na leitura dos dados, verifique o backend'
                });
            }
        });

    });


    $(document).on("click", "#btnGerarSugestoes", function () {

        myip = $("#myip").text();

        //alert('entrei');
        id_circulo = $("#circulo_id").text();

        url = 'http://' + myip + ':4999/gerar_recomendacoes_respostas_sem_pontuacao'

        //alert(url);
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (resultado) {

                if (resultado.message != "ok") {
                    Swal.fire({
                        icon: 'error',
                        text: resultado.details
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        text: resultado.details
                    });
                }
            },
            error: function () {
                Swal.Fire({
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
        pos = url.search("/corrigir.html");
        if (pos > 0) {
            protocolo = "http://"
            http = protocolo.length;
            meuip = url.substring(http, pos);
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
            timer: 3000
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
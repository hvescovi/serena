// when the document is ready...
$(function () {

    function jmessage(tipo, mensagem) {
        alert(mensagem);
    }

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
                    jmessage("ERRO", resultado.details);
                } else {

                    // sucesso, vamos abrir a questão...

                    resps = resultado.details;

                    ultima_questao_id = 0;

                    // mostra o gabarito quando mostrar o cabeçalho de uma nova questão
                    mostrar_gabarito = false;

                    cabecalho = '<div class="row"><div class="col border border-info rounded wood m-2">';

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

                        // ESCAPE the html
                        // https://stackoverflow.com/questions/40211475/javascript-jquery-how-to-get-html-and-display-html-including-tags
                        // 

                        semhtml = resp.resposta.replaceAll("<", "&lt;");
                        semhtml = semhtml.replaceAll(">", "&gt;");

                        if (resp.questao.type != "multiplaescolha") {
                            semhtml = '<pre>' + semhtml + '</pre>';
                        }

                        novaresp += semhtml; //resp.resposta;

                        // substituir quebra de linha por <br>
                        //novaresp = novaresp.replace(new RegExp('\r?\n','g'), '<br>');

                        // aparencia da pontuação (tem destaque se ainda não foi corrigida)
                        aparencia = "";

                        // gabarito padrão
                        gabarito = "*";

                        // se já houver nota, vai aparecer apenas a sugestão ao lado
                        sugerido = "";


                        //TODO: só mostra gabarito se houver respostas a pontuar
                        // depois pode mostrar para todas as situações, 
                        // não precisa ter essa restrição

                        // pontuação sugerida, entre 0 e 1
                        pt = "";

                        if (resp.questao.type == "multiplaescolha") {

                            acertou = false;
                            for (j in resp.questao.alternativas) {
                                alt = resp.questao.alternativas[j];
                                if (alt.id == resp.resposta) {
                                    acertou = alt.certa;
                                    novaresp += " => " + ajustaImagens(alt.descricao);
                                }
                            }
                            if (acertou) {
                                novaresp += " !! ACERTOU !! ";
                                pt = 1;
                            } else {
                                novaresp += " _ errou _";
                                pt = 0;
                            }
                        } else if (resp.questao.type == "aberta") {
                            temp = resp.questao.resposta;
                            temp = temp.replaceAll("<", "&lt;");
                            temp = temp.replaceAll(">", "&gt;");
                            gabarito = '<pre>' + temp + '</pre>'; //.replace("<", " (MENOR) ");
                            pt = resp.pontuacao_sugerida;
                        } else if (resp.questao.type == "completar") {
                            temp = resp.questao.lacunas;
                            temp = temp.replaceAll("<", "&lt;");
                            temp = temp.replaceAll(">", "&gt;");
                            gabarito = '<pre>' + temp + '</pre>'; //.replace("<", " (MENOR) ");
                            pt = resp.pontuacao_sugerida;
                        }
                        aparencia = ' class = "bg-warning" ';

                        if (resp.pontuacao != null) { // já tem pontuação?
                            aparencia = ''; // volta aparência branca

                            // já tem resposta
                            pt = resp.pontuacao;
                            sugerido = '<span id="sugerido"' + resp.id + '"class="bg-info" title="pontuação sugerida">' + resp.pontuacao_sugerida + '</span>';
                        }

                        novaresp += ' <input type="text" ' + aparencia + ' size="3" id="pt' + resp.id + '" value="' + pt + '">';
                        novaresp += ' <button id="btpt' + resp.id + '" class="pontuar_resposta">assign grade</button> ' + sugerido;
                        novaresp += ' <img src="images/check-circle.svg" id="corrigida' + resp.id + '" class="d-none">';

                        // a linha abaixo mostra o nome do respondente :-p
                        /*
                        if (resp.respondente.nome == "VINICIUS FRIEDRICH BLAU") {
                            novaresp += ' =======> ' + resp.respondente.nome;
                        }
                        */
                        
                        //novaresp += ' =======> ' + resp.respondente.nome;

                        novaresp += "</div>"; //col
                        novaresp += "</div>"; //row

                        // antes de mostrar a nova resposta: precisa mostrar gabarito?
                        if (mostrar_gabarito) {
                            lin += '<div class="row"><div class="col border border-warning bg-warning">';
                            lin += '<h5 class="bg-info">CORRECT ANSWER</h5>' + gabarito;
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
                jmessage("ERRO", 'ocorreu algum erro na leitura dos dados, verifique o backend');
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
                Swal.fire({
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
        pos = url.search("/corrigir.html");
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

    var circulo = 0;
    // circulo 1 = turma 301
    // circulo 2 = turma 302

    $("#circulo_id").text(circulo);

    myip = $("#myip").text();

    // obtém do backend qual é o círculo ativo
    url = 'http://' + myip + ':4999/circulo_ativo';

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (resultado) {
            if (resultado.message == "ok") {
                circulo = resultado.details.id;
                $("#circulo_id").text(circulo);
            } else {
                jmessage("ERRO", 'não foi possível obter o círculo ativo :-(');
            }
        },
        error: function () {
            jmessage("ERRO", 'ocorreu algum erro na leitura dos dados, verifique o backend');
        }

    });

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

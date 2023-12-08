
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
  
    //alert(document.URL);
    if (document.URL.startsWith("http://localhost")) {
        $("#myip").text("localhost");
    } else if (document.URL.startsWith("http://k8master")) {
        $("#myip").text("k8master.blumenau.ifc.edu.br");
    } else {
        url = document.URL;
        pos = url.search("/escolher.html");
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


    $(document).on("click", ".faz_escolha", function () {

        var id = $(this).attr('id'); // resp_N
        var id_resp = id.substring(5);
        // guarda na sessão
        sessionStorage.setItem("id_quem_responde", id_resp);
        //alert("guardei: "+id_resp);
        $(this).append(" ESCOLHIDO => <a href=circulo.html>INICIAR</a>");

    });




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

                // vamos obter a informação dos respondentes
                url = 'http://' + myip + ':5000/retornar_contagem_respostas_geral/' + circulo;

                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json', // vou receber a resposta em json,
                    //data: dados, // dados a enviar    //JSON.stringify({ "message": "ok" }), // dados a enviar
                    //contentType: "application/json",
                    success: function (resultado) {
                        if (resultado.message == "ok") {
                            // percorre os resultados
                            for (var resp of resultado.details) {
                                var lin = `<tr>
                                <td class="faz_escolha" id="resp_${resp.id}">
                                ${resp.nome}</td>
                                <td>${resp.q}</td>
                                </tr>`;
                                $("#tabela").append(lin);
                            }
                            
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

});
export default function ajustarImagens(texto) {
    var myip = "localhost"; // a interface de admin vai rodar sempre em localhost - suposição inicial
    var url = 'http://' + myip + ':5000/imagem/';
    console.log(url);
    var retorno = texto.replace(/<img src=/gi, "<img src=" + url);
    return retorno;
}
import axios from 'axios';

const backendIP = import.meta.env.VUE_APP_BASE_URL;

console.log(import.meta.env.VUE_APP_BASE_URL);
console.log(import.meta.env.MODE);
console.log(import.meta.env.TITLE);
console.log(import.meta.env.BASE_URL);

export default {
  data() {
    return {
      circles: [],
      questions: [],
      operation: "",
      message: "",
      selected_question: 0,
      error: "",
      selected_circle: 0
    }
  },
  methods: {
    action_questions_and_circle() {
      if (this.operation == "list") { // list all questions
        fetch(backendIP+'/question')
          .then(response => response.json())
          .then(json => {
            //console.log(json);
            if (json.result == 'ok') {
              // modifica enunciado para consertar a URL da imagem
              var url = backendIP+'/imagem/';              
              for (let i in json.details) {
                var en = json.details[i].enunciado;
                en = en.replace(/<img src=/gi, "<img src=" + url);
                //console.log(en);
                json.details[i].enunciado = en;
              }
              // retorna as questões
              this.questions = json.details;
            } else {
              // está mascarando o erro, melhorar essa parte depois
              this.questions = []
            }
          })
          .catch(error => {
            this.error = error;
          });
      } else if (this.operation == "add") { // add question to a circle
        console.log(this.selected_question);
        console.log(this.selected_circle);
        axios.post(backendIP+'/questions_circle/'+this.selected_question+'/'+this.selected_circle)
        .then(response => {
          console.log(response);
          if (response.data.result == 'ok') {
            this.message = "Questão incluída no círculo, com sucesso!";
          } else {
            this.message = response.data.details;
          }
        })
        .catch(error => {
          this.mensagem = error;
        });
        
      }
    }
  },
  mounted() {
    fetch(backendIP+'/circle')
      .then(response => response.json())
      .then(json => {

        if (json.result == 'ok') {
          this.circles = json.details;
          // TODO: precisa atualizar o selected_circle!!!
          // nao sei porque ele não faz automaticamente :-/          
        } else {
          // está mascarando o erro, melhorar essa parte depois
          this.circles = []
        }
      })
      .catch(error => {
        this.error = error;
      });
  }
};
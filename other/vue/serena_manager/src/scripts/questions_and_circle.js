import axios from 'axios';

// vars are only packed when the system is built
// $ vue-cli-service build
console.log(import.meta.env.VUE_APP_BASE_URL);
console.log(import.meta.env.MODE);
console.log(import.meta.env.TITLE);
console.log(import.meta.env.BASE_URL);

var backendIP = "http://localhost:4999"
if (import.meta.env.VUE_APP_BASE_URL) {
  backendIP = import.meta.env.VUE_APP_BASE_URL
}


export default {
  data() {
    return {
      circles: [],
      questions: [],
      operation: "",
      message: "",
      checkedOptions: [],
      error: "",
      selected_circle: 0
    }
  },
  methods: {
    action_questions_and_circle() {
      if (this.operation == "list") { // list all questions
        fetch(backendIP + '/question')
          .then(response => response.json())
          .then(json => {
            //console.log(json);
            if (json.result == 'ok') {
              // modifica enunciado para consertar a URL da imagem
              var url = backendIP + '/imagem/';
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
        console.log(this.checkedOptions);

        let mess = "oi ";
        console.log('=>' + mess);
        // loop through question to add

        // chatgpt version

        let promises = this.checkedOptions.map(option => {
          return axios.post(backendIP + '/questions_circle/' + option + '/' + this.selected_circle)
            .then(response => {
              if (response.data.result === 'ok') {
                mess += `\nQuestão ${option} incluída no círculo, com sucesso!`;
              } else {
                mess += `\nProblema na questão ${option}: ${response.data.details}`;
              }
            })
            .catch(error => {
              mess += `\nERRO: ${error}`;
            });
        });

        Promise.all(promises).then(() => {
          console.log('resultado:' + mess);
          this.message = mess;
        });

        /*
        for (let i = 0; i < this.checkedOptions.length; i++) {

          axios.post(backendIP + '/questions_circle/' + this.checkedOptions[i] + '/' + this.selected_circle)
            .then(response => {
              console.log(response);
              if (response.data.result == 'ok') {
                mess = mess + "\nQuestão " + this.checkedOptions[i] + " incluída no círculo, com sucesso!";
                console.log('=>ok'+mess);
              } else {
                mess = mess + "\nProblema na questão " + this.checkedOptions[i] + ": " + response.data.details;
                console.log('=>prob'+mess);
              }
            })
            .catch(error => {
              
              mess = mess + "ERRO: " + error;
              console.log('=>err'+mess);
            });
        }
        console.log('resultado:'+mess);
        this.message = mess;

        */

        /*
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
        });*/

      }
    }
  },
  mounted() {
    fetch(backendIP + '/circle')
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
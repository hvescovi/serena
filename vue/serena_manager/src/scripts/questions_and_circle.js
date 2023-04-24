import axios from 'axios';

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
      if (this.operation == "list") {
        fetch('http://localhost:4999/question')
          .then(response => response.json())
          .then(json => {
            console.log(json);
            if (json.result == 'ok') {
              this.questions = json.details;
            } else {
              // está mascarando o erro, melhorar essa parte depois
              this.questions = []
            }
          })
          .catch(error => {
            this.error = error;
          });
      } else if (this.operation == "add") {
        console.log(this.selected_circle);
        console.log(this.selected_question);
        
        axios.post('http://localhost:4999/questions_circle/'+this.selected_question+'/'+this.selected_circle)
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
    fetch('http://localhost:4999/circle')
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
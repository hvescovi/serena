import axios from 'axios';

export default {
  data() {
    return {
      circles: [],
      questions: [],
      operation: "",
      message: "",
      selected_question: "",
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
      }
    }
  },
  mounted() {
    fetch('http://localhost:4999/circle')
      .then(response => response.json())
      .then(json => {

        if (json.result == 'ok') {
          this.circle = json.details;
        } else {
          // está mascarando o erro, melhorar essa parte depois
          this.questions = []
        }
      })
      .catch(error => {
        this.error = error;
      });
  }
};
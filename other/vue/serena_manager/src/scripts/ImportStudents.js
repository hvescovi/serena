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
      message: "",
      error: "",
      StudentsList: ""
    }
  },
  methods: {
    ImportStudents() {
        axios.post(backendIP+'/incluir_respondentes')
        .then(response => {
          //console.log(response);
          //if (response.data.result == 'ok') {
            this.message = response.data.details;
        })
        .catch(error => {
          this.mensagem = error;
        });
    }
  }
};
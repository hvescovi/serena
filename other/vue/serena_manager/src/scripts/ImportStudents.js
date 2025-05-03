import axios from 'axios';
import { StudentsCsvToJson } from './utils.js'

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
      StudentsList: "AMANDA PAZIANOTI HORST,amanda.horst07@gmail.com,|g:optweb-301-2025|\nANTONIO HENRIQUE ROHLING FROEHNER,rf.antonio2007@gmail.com,|g:optweb-301-2025|"
    }
  },
  methods: {
    action_ImportStudents() {

      // AMANDA PAZIANOTI HORST,amanda.horst07@gmail.com,|g:optweb-301-2025|

      let paraEnviar = StudentsCsvToJson(this.StudentsList);
      //console.log(StudentsCsvToJson(this.StudentsList));

      axios.post(backendIP + '/incluir_respondentes',
        paraEnviar,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
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
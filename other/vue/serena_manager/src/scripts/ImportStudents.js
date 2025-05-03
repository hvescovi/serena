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
      action_radio: "",
      delimiter: ";",
      emails: "",
      buttonValue:"",
      observacao: "|g:optweb-301-2025|",
      StudentsList: "AMANDA PAZIANOTI HORST,amanda.horst07@gmail.com,|g:optweb-301-2025|\nANTONIO HENRIQUE ROHLING FROEHNER,rf.antonio2007@gmail.com,|g:optweb-301-2025|"
    }
  },
  methods: {
    action_ImportStudents() {

      if (this.buttonValue == "clean") {
        // remove numbers from content
        this.StudentsList = this.StudentsList.replace(/[0-9]/g, '');

      } else if (this.buttonValue == "emails") {

        // initialize final result
        const result = [];

        // strip lines
        const lines = this.StudentsList.split('\n');

        // get emails
        const string_emails = this.emails;

        // if contains @
        if (string_emails.includes("@")) {

          // strip email by ...
          const emails = string_emails.split(this.delimiter);

          // loop through lines, one per email
          for (let i = 0; i < emails.length; i++) {
            // create new line
            let newLine = lines[i] + "," + emails[i].trim();
            // add to the result
            result.push(newLine);
          }
          // replace the new content :-)
          // return each line separated by new line
          this.StudentsList = result.join("\n");
        } else {
          this.message = "INSIRA EMAILS NA caixa; esse emails são obtidos no Sigaa, menu Turma > Participantes > Lista de E-mail dos discentes da turma (exemplo: amanda.horst07@gmail.com ; rf.antonio2007@gmail.com ; arielmartinsfarias@gmail.com ; arturpagel7@gmail.com)";
        }

      } else if (this.buttonValue == "obs") {
        // initialize final result
        const result = [];

        // strip lines
        const lines = this.StudentsList.split('\n');

        // loop through lines, adding obs
        for (let i = 0; i < lines.length; i++) {
          // create new line
          let newLine = lines[i] + "," + this.observacao
          // add to the result
          result.push(newLine);
        }
        // replace the new content :-)
        // return each line separated by new line
        this.StudentsList = result.join("\n");

      } else if (this.buttonValue == "save") {
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
            let resp = response.data.details;
            this.message = resp.replaceAll(';', '\n');
          })
          .catch(error => {
            this.mensagem = error;
          });
      }

    }
  }
};
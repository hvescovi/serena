<script src="../scripts/ImportStudents.js"></script>

<style>
.destaque {
    font-weight: bold;
}

.enunciado_sty {
    border-radius: 25px;
    padding: 20px;
    margin: 10px;
    border-color: lightgray;
    border-style: solid;
}

.big_title {
    font-size: 2em;
    background: lightgreen;
}
</style>

<template>
    <h1>Importação de Estudantes</h1>

    <div id="d123">
        <form @submit.prevent="action_ImportStudents">

            Estudantes (nome, email):
            <br>
            <textarea v-model="StudentsList" rows="30" cols="80">
            </textarea>
            <!-- example
            
            ARIEL MARTINS FARIAS,arielmartinsfarias@gmail.com, |g:optweb-301-2025|
            
            -->

            <p v-if="error">{{ error }}</p>
            <br>

        <!--    <input type="radio" name="action" value="clean" v-model="action_radio" /> -->
            Limpar números
            <button value="clean" @click="buttonValue = $event.target.value">LIMPAR</button>
            
        <hr>
            <hr>
        <!--    <input type="radio" name="action" value="emails" v-model="action_radio" /> -->
            Preencher emails <br>
            Emails: <textarea v-model="emails" rows="5" cols="30"></textarea>
            <br>
            Delimitador = <input v-model="delimiter" size="1">
            <button value="emails" @click="buttonValue = $event.target.value">PREENCHER EMAILS</button>
        <hr>
        <!--    <input type="radio" name="action" value="obs" v-model="action_radio" /> -->
            <hr>
            Observação: <input v-model="observacao">
            <br>
            <button value="obs" @click="buttonValue = $event.target.value">Preencher</button>
        <hr>
        <!-- <input type="radio" name="action" value="save" v-model="action_radio" /> -->
            <button value="save" @click="buttonValue = $event.target.value">CADASTRAR!</button>
        </form>

        <br>
        <hr>
        <br>

        <textarea v-model="message" rows="30" cols="50">
        </textarea>

    </div>
</template>

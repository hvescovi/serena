<template>
    <h1>Importação de Estudantes</h1>

    <div id="d123">
        <form @submit.prevent="action_questions_and_circle" id="f123">

            Estudantes (nome, email):
            <br>
            <textarea v-model="StudentsList" rows="10">
                nome,email
            </textarea>

            <p v-if="error">{{ error }}</p>
            <br>
            <button>Do it!</button>
        </form>

        <input v-model="message" disabled>

    </div>
</template>

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
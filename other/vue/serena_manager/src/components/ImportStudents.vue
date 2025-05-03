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
        <form @submit.prevent="action_ImportStudents" id="f123">

            Estudantes (nome, email):
            <br>
            <textarea v-model="StudentsList" rows="10" cols="40">
            </textarea>
            <!-- example
            
            ARIEL MARTINS FARIAS,arielmartinsfarias@gmail.com, |g:optweb-301-2025|
            
            -->

            <p v-if="error">{{ error }}</p>
            <br>
            <button>Do it!</button>
        </form>

        <input v-model="message" disabled>

    </div>
</template>


<template>
    <div id="div_questions_and_circle">
        <form @submit.prevent="action_questions_and_circle" id="form_questions_and_circle">
            <p>
                Active circle:
            <div v-if="circles.length">
                <div class="card" v-for="c in circles" :key="c.id">
                    <input type="radio" v-model="selected_circle" name="selected_circle" :checked="c.ativo == 1"
                        :value="c.id" />
                    {{ c.id }}) {{ c.nome }}
                </div>
            </div>
            <p v-if="error">{{ error }}</p>
            <!-- <select v-model="circles">
                <option v-for="(c, idx) in circles" :key="idx" :value="c.id">
                    {{ c.nome }}
                </option>
            </select> -->
            </p>

            <p><span class="destaque">Action</span> to do:</p>
            <p>
                <input type="radio" v-model="operation" value="define_circle" name="define_circle" />Define active circle
            </p>
            <p>
                <input type="radio" v-model="operation" value="add" name="operation" />Add question to the checked circle
            </p>
            <p>
                <input type="radio" v-model="operation" value="list" name="operation" />List all questions
            </p>

            <button>Do it!</button>
        </form>

        <input v-model="message">

        <div v-if="questions.length">
            <div class="card" v-for="q in questions" :key="q.id">

                <div class="enunciado_sty">
                    <span class="big_title">
                        <input type="radio" v-model="selected_question" :value="q.id" name="selected_question" /> {{ q.id }}
                    </span>

                    <hr />

                    <div v-html="q.enunciado" class="question_title">
                    </div>
                </div>


            </div>

        </div>
        <p v-if="error">{{ error }}</p>

    </div>
</template>

<script src="../scripts/questions_and_circle.js"></script>

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
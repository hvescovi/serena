<template>
    <div id="div_questions_and_circle">
        <form @submit.prevent="action_questions_and_circle" id="form_questions_and_circle">
            <p>
                Circle:
                <select v-model="circles">
                </select>
            </p>
            <p>
                Question:
                <select v-model="questions">
                </select>
            </p>
            <p>
                <input type="radio" v-model="operation" value="add" 
                name="operation" />Add question to Circle
            </p>
            <p>
                <input type="radio" v-model="operation" value="list" 
                name="operation" />List questions in circle
            </p>

            <button>Do it!</button>
        </form>

        <input v-model="message">

        <div v-if="questions.length">
            <div class="card" v-for="q in questions" :key="q.id">
                <input type="radio" v-model="selected_question" value="{{ q.id }}" name="selected_question"/> {{ q.id }} 
                {{ q.enunciado }}
            </div>
        </div>
        <p v-if="error">{{ error }}</p>

    </div>
</template>

<script src="../scripts/questions_and_circle.js"></script>
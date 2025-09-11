<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Gerenciar Círculos</h1>

    <form @submit.prevent="isEditing ? updateCirculo() : saveCirculo()" class="mb-6 space-y-2">
      
      Nome: <input v-model="form.nome" placeholder="Nome" class="input" ref="firstField" />
      Data: <input v-model="form.data" placeholder="Data" class="input" />
      Filtro do respondente: <input v-model="form.filtro_respondente" placeholder="Filtro Respondente" class="input" />
      Ativo (0 ou 1) <input v-model="form.ativo" placeholder="Ativo (0/1)" class="input" />
      Número de questões a responder no círculo: <input v-model.number="form.maximo_questoes" placeholder="Máximo de Questões" class="input" />
      Autor: <input v-model="form.autor" placeholder="Autor" class="input" />
      Senha: <input v-model="form.senha" type="password" placeholder="Senha" class="input" />
      Número de questões reserva: <input v-model.number="form.n_reservas" placeholder="Número de Questões Reservas" class="input" />

      Número de questões no círculo (apenas visualizar): <input v-model.number="form.questoes.length" placeholder="Número de Questões no Círculo" class="input" disabled />

      <button v-if="!isEditing" type="submit" class="btn">Incluir novo!</button>
      <button v-else type="submit" class="btn">Atualizar</button>
      <button v-if="isEditing" type="button" class="btn" @click="resetForm">Cancelar</button>

    </form>

    <div v-if="circulos.length" class="space-y-4">
      <div v-for="c in circulos" :key="c.nome" class="border p-4 rounded shadow">
        <p><strong>Nome:</strong> {{ c.nome }}</p>
        <p><strong>Data:</strong> {{ c.data }}</p>
        <p><strong>Autor:</strong> {{ c.autor }}</p>
        <p><strong>Ativo:</strong> {{ c.ativo }}</p>
        <p><strong>Máximo de Questões:</strong> {{ c.maximo_questoes }}</p>
        <p><strong>Filtro Respondente:</strong> {{ c.filtro_respondente }}</p>
        <p><strong>Senha:</strong> {{ c.senha }}</p>  
        <p><strong>Número que questões reservas (discente pode ver a mais):</strong> {{ c.n_reservas }}</p>
        <p><strong>Número de questões:</strong> {{ c.questoes.length }}</p>

        <button @click="editCirculo(c)" class="btn-small mr-2">Editar</button>
        <button @click="deleteCirculo(c.nome)" class="btn-small text-red-500">Excluir</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API = 'http://localhost:4999'

const circulos = ref([])
const form = ref({
  nome: 'AV1 optweb EMI maio 2025',
  data: '05/05/2025',
  filtro_respondente: '|g:optweb-301-2025|',
  ativo: '0',
  maximo_questoes: 10,
  autor: 'hvescovi',
  senha: '',
  questoes: [],
  respostasNoCirculo: [],
  n_reservas: 0
})

//editing or adding?
const isEditing = ref(false)

// refer to the first field
const firstField = ref(null)

const fetchCirculos = async () => {
  try {
    const res = await axios.get(`${API}/list/Circulo`)
    circulos.value = res.data.details
  } catch (e) {
    alert("Erro ao carregar círculos")
  }
}

const saveCirculo = async () => {
  try {
    await axios.post(`${API}/add/Circulo`, form.value)
    await fetchCirculos()
    resetForm()
    isEditing.value = false
  } catch (e) {
    alert("Erro ao salvar círculo")
  }
}

const updateCirculo = async () => {
  try {
    await axios.put(`${API}/circle/${form.value.id}`, form.value)
    await fetchCirculos()
    resetForm()
    isEditing.value = false
  } catch (e) {
    alert("Erro ao atualizar círculo: " + e.message)
  }
}

const deleteCirculo = async (nome) => {
  try {
    await axios.delete(`${API}/delete/Circulo/${nome}`)
    await fetchCirculos()
  } catch (e) {
    alert("Erro ao excluir círculo")
  }
}

const editCirculo = (c) => {
  form.value = { ...c }
  isEditing.value = true
  // Focus the first input after editing
  setTimeout(() => {
    firstField.value?.focus()
  }, 0);
}

const resetForm = () => {
  form.value = {
    nome: '',
    data: '',
    filtro_respondente: '',
    ativo: '',
    maximo_questoes: 0,
    autor: '',
    senha: '',
    questoes: [],
    respostasNoCirculo: [],
    n_reservas: 0
  }
  isEditing.value = false
}

onMounted(fetchCirculos)
</script>

<style></style>
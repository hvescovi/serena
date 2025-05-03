import { createMemoryHistory, createRouter } from 'vue-router'

import QuestionsAndCircle from './components/QuestionsAndCircle.vue'
import ImportStudents from './components/ImportStudents.vue'

const routes = [
  { path: '/', component: QuestionsAndCircle },
  { path: '/import', component: ImportStudents }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router

// we wan to install:
// npm install vue-router@4
// https://router.vuejs.org/installation
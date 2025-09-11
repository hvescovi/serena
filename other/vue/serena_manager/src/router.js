import { createMemoryHistory, createRouter } from 'vue-router'

import QuestionsAndCircle from './components/QuestionsAndCircle.vue'
import ImportStudents from './components/ImportStudents.vue'
import crudCircle from './components/crudCircle.vue'

const routes = [
  { path: '/', component: QuestionsAndCircle },
  { path: '/import', component: ImportStudents },
  { path: '/crudCircle', component: crudCircle }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router

// we wan to install:
// npm install vue-router@4
// https://router.vuejs.org/installation
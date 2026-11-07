/**
 * Escapes HTML characters to their corresponding HTML entities.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return text;
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// usado para questões antigas que tem imagem em arquivo externo
   export function ajustaImagens(API, texto) {
    if (texto.includes(".png")) {
      let url = `${API}/imagem/`;
      return texto.replace(/<img src=/gi, "(<b>QUESTÃO ANTIGA</b>)<img src=" + url);
    } else {
      // new question types don't need adjustment
      return texto;
    }
  }
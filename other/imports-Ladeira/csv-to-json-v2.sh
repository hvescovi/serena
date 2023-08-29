#!/bin/bash

# Uso:
# > bash csv-to-json-v2.sh ARQUIVO-CSV-DE-ENTRADA.csv [ARQUIVO-DE-SAIDA.json]
# Caso prefira, conceda permissão de execução (chmod +x csv-to-json-v2.sh) e depois execute com:
# > ./csv-to-json-v2.sh ARQUIVO-CSV-DE-ENTRADA.csv [ARQUIVO-DE-SAIDA.json]

INPUT="$1" # Arquivo CSV informado na linha e comando
OUTPUT="$2" # Arquivo de saída (JSON). Se preferir, redirecione a saída padrão para o seu arquivo.
ATTRIB_NAMES=("nome" "email" "observacao") # Define o nome de cada atributo
MAIN_NAME="students" # Define o nome principal do objeto JSON

# Usa a ferramenta jq para montar o JSON com base nos dados de entrada
# O JSON associa as chaves do array $ATTRIB_NAMES com cada valor do arquivo CSV, em ordem.
# Ou seja, a primeira coluna do CSV será o valor de name, a segunda será o valor de code
# e a terceira será o valor de email.
# Caso o CSV tenha diferente número de colunas e caso o nome delas deva ser outro, basta
# alterar essas colunas diretamente na linha 10.
# O script considera que o separador do arquivo CSV é o ponto-e-vírgula (;).

jq -Rn '{
  ($mainName): [(inputs / "\t") | with_entries(.key |= ($attribs / " ")[.])]
}' --arg attribs "${ATTRIB_NAMES[*]}" --arg mainName "${MAIN_NAME}" < $INPUT > ${OUTPUT:-/dev/stdout}

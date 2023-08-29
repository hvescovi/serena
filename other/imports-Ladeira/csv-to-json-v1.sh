#!/bin/bash

# Uso:
# > bash csv-to-json-v1.sh ARQUIVO-CSV-DE-ENTRADA.csv [ARQUIVO-DE-SAIDA.json]
# Caso prefira, conceda permissão de execução (chmod +x csv-to-json-v1.sh) e depois execute com:
# > ./csv-to-json-v1.sh ARQUIVO-CSV-DE-ENTRADA.csv [ARQUIVO-DE-SAIDA.json]

INPUT="$1" # Arquivo CSV informado na linha e comando
OUTPUT="$2" # Arquivo de saída (JSON). Se preferir, redirecione a saída padrão para o seu arquivo.
ATTRIB_NAMES=("name" "code" "email") # Define o nome de cada atributo
MAIN_NAME="students" # Define o nome principal do objeto JSON

# Usa a ferramenta jq para montar o JSON com base nos dados de entrada
# O JSON associa os valores do array $ATTRIB_NAMES com cada valor do arquivo CSV, em ordem.
# Ou seja, a primeira coluna do CSV será o valor de name, a segunda será o valor de code
# e a terceira será o valor de email.
# Caso o CSV tenha diferente número de colunas e caso o nome delas deva ser outro, basta
# alterar essas colunas diretamente na linha 10.
# O script considera que o separador do arquivo CSV é o ponto-e-vírgula (;).
jq --arg jq_var ${ATTRIB_NAMES} --arg jq_var ${MAIN_NAME} -Rsn '
	{"'${MAIN_NAME}'":
    	[inputs
    	| . / "\n"
     	| (.[] | select(length > 0) | . / ";") as $input
     	| {
     		"'${ATTRIB_NAMES[0]}'": $input[0],
     		"'${ATTRIB_NAMES[1]}'": $input[1],
     		"'${ATTRIB_NAMES[2]}'": $input[2]
     	  }
    	]
   }
' < $INPUT > ${OUTPUT:-/dev/stdout}
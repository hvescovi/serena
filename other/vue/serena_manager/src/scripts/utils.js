// receive csv data in multiple lines
// from a textarea
export function StudentsCsvToJson(students_csv) {
    // from google IA

    const lines = students_csv.split('\n');
    const headers = ["nome", "email", "observacao"]
    // prepare the result
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        // initialize de tuple
        const obj = {};
        // break the data by comma
        const currentLine = lines[i].split(',');

        // fill the fields
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        // push object in the result
        result.push(obj);
    }
    return result;
}


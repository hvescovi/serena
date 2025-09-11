export interface Respondent {
    id: string;
    name: string;
    answeredQuestions: number;
}

export interface Circle {
    id: string;
    name: string;
    creationDate: string;
}

export interface Question {
    id: string;
    text: string;
    answered: boolean;
}
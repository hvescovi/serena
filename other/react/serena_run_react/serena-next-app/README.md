# Serena Next.js Application

This project is a Next.js application that replicates the functionality of the original HTML page `circulo.html`. It includes a navigation bar, respondent information, question controls, and a dynamic questions table.


## Project Structure

```
serena-next-app
├── public
│   ├── icons
│   ├── images
│   └── manifest.json
├── src
│   ├── components
│   │   ├── Navbar.tsx
│   │   ├── RespondentInfo.tsx
│   │   ├── QuestionControls.tsx
│   │   └── QuestionsTable.tsx
│   ├── pages
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   └── escolher.tsx
│   ├── styles
│   │   ├── bootstrap.min.css
│   │   └── meuestilo.css
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── helpers.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **Responsive Navigation Bar**: Displays the application title, IP address, circle name, creation date, and a link to the "choose" page.
- **Respondent Information**: Shows the respondent's name and the number of answered questions, with a hidden input for the respondent's ID.
- **Question Controls**: Includes buttons for passing the turn and showing questions, with dynamic visibility based on user interactions.
- **Dynamic Questions Table**: A component designed to display questions dynamically as data becomes available.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd serena-next-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Technologies Used

- Next.js
- React
- TypeScript
- Bootstrap

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
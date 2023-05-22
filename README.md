# repo-ai
Ask questions about GitHub repositories using Langchain for Node.js. This is a database free example of using Langchain to work with the OpenAI GPT API.

## Setup

Create a .env file with your credentials or set them up as environment variables:

```
OPENAI_API_KEY=
GITHUB_TOKEN=
```

## CLI

You can run the code in this repo via the CLI by leveraging the `-cli` suffixed files.

## 1. Generate embeddings

To generate the embeddings, run `npx ts-node generate-cli.ts "https://github.com/Vheissu/cortex-device-list"` which will populate local vector embeddings. Make sure you change to the repository you want to create embeddings for.

## 2. Search

After you've created embeddings, you can run `npx ts-node search-cli.ts "My question here"` to ask your question about the repository.

## Frontend

There is also a simple front-end application in the `frontend` which will allow you to use a simple interface to query your repo. Please ensure you run the local server first before you attempt to ask a question: `npx ts-node server.ts` which will run on port `3000`.

Also, don't forget to generate your embeddings first. The server will look for a `vectors` folder which will contain the generate vectors to do cosine similarity search.

To run the front-end app, go into the `frontend` directory and `npm start` (assuming you also ran `npm install` too) and the browser will open the app.
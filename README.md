# repo-ai
Ask questions about GitHub repositories using Langchain for Node.js. This is a database free example of using Langchain to work with the OpenAI GPT API.

## Setup

Create a .env file with your credentials or set them up as environment variables:

```
OPENAI_API_KEY=
GITHUB_TOKEN=
```

## 1. Generate embeddings

To generate the embeddings, run `npx ts-node generate.ts "https://github.com/Vheissu/cortex-device-list"` which will populate local vector embeddings. Make sure you change to the repository you want to create embeddings for.

## 2. Search

After you've created embeddings, you can run `npx ts-node search.ts "My question here"` to ask your question about the repository.
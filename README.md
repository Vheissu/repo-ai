# repo-ai
Ask questions about GitHub repositories using Langchain for Node.js. This is a database free example of using Langchain to work with the OpenAI GPT API.

## Setup

Create a .env file with your credentials or set them up as environment variables:

```
OPENAI_API_KEY=
GITHUB_TOKEN=
```

## Generate embeddings

To generate the embeddings, run `npx ts-node generate.ts` which will populate the `embeddings.json` file. Make sure you change the `repoUrl` variable at the bottom with your repository.

## Search

The question is hardcoded at present until there is a UI. At the bottom of `main.ts` change the question to test.
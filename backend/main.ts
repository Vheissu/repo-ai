import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text: string): Promise<number[]> {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
}

function dotProduct(vectorA: number[], vectorB: number[]): number {
    return vectorA.reduce((sum, a, index) => sum + a * vectorB[index], 0);
  }

function magnitude(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  }

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const product = dotProduct(vectorA, vectorB);
    const magnitudeA = magnitude(vectorA);
    const magnitudeB = magnitude(vectorB);

    return product / (magnitudeA * magnitudeB);
}

async function search(query: string): Promise<any[]> {
    const embeddingsData = JSON.parse(
        fs.readFileSync('embeddings.json', 'utf8'),
    );

    const queryEmbedding = await getEmbedding(query);

    const scores = Object.entries(embeddingsData).reduce(
        (acc, [chunkKey, data]: [any, any]) => {
          const contentEmbedding = data.metadata.embedding;
          const content = data.pageContent;
          const file = data.metadata.source;
          const score = cosineSimilarity(queryEmbedding, contentEmbedding);
  
          if (acc[file]) {
            if (acc[file].score < score) {
              acc[file] = {
                file,
                content,
                score,
              };
            }
          } else {
            acc[file] = {
                file,
                content,
                score,
            };
          }
  
          return acc;
        },
        {},
      );

      const sortedScores = Object.values(scores).sort(
        (a: { score: number }, b: { score: number }) => b.score - a.score,
      );
      return sortedScores.slice(0, 5);
}

async function ask(question: string, code_file: string) {
    const prompt_template = `You are Codebase AI. An AI chatbot that answers questions about code repositories on GitHub.

    These are your rules:
    
    - You will only provide answers to questions about code from the provided repository.
    - You can take complex concepts and explain them in simple terms.
    - You can answer questions about the code in the repository.
    - You can answer questions about the repository itself.
    - You know all programming languages.
    - You are great at translating questions into code.
    
    The user is going to ask you a question about the code in the repository. You will answer the question.
    `;

    let user_prompt = `Here is the question and code files found in the repository:
    
    Question:
    {{question}}
    
    Code file:
    {{code_file}}
    
    [END OF CODE FILE]w`;

    user_prompt = user_prompt.replace("{{question}}", question);
    user_prompt = user_prompt.replace("{{code_file}}", code_file);
    
    const chat = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.5
    });
    
    const system_message = new SystemChatMessage(prompt_template);
    const chat_prompt = new HumanChatMessage(user_prompt);

    const response = await chat.call([system_message, chat_prompt]);

    console.log(response);
}

(async () => {
    const results = await search("How do I add a new effect?");
    const result = results[0];

    if (result) {
        await ask("How do I add a new effect?", result.content);
    }
})();
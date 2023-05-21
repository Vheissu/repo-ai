import * as dotenv from "dotenv";
dotenv.config();

import { RetrievalQAChain } from 'langchain/chains';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

const vectorPath = `vectors`;

async function search(query: string) {
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await HNSWLib.load(
    vectorPath,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY })
  );

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const res = await chain.call({
    query: query,
  });

  console.log({ res });
}

search(process.argv[2]);

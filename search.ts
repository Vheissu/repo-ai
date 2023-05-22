import * as dotenv from "dotenv";
dotenv.config();

import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

const vectorPath = `vectors`;

export async function search(query: string, openaiApiKey: string = null) {
  if (!query) {
    throw new Error("Missing question");
  }

  openaiApiKey = openaiApiKey || process.env.OPENAI_API_KEY;

  const model = new OpenAI({
    openAIApiKey: openaiApiKey,
  });

  const vectorStore = await HNSWLib.load(
    vectorPath,
    new OpenAIEmbeddings({ openAIApiKey: openaiApiKey })
  );

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const res = await chain.call({
    query: query,
  });

  if (res.text) {
    return res.text;
  } else {
    return "There was an error.";
  }
}

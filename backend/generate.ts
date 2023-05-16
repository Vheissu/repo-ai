import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import { Document } from "langchain/document";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { Octokit } from "@octokit/rest";
import { Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-3-encoder";
import { IEmbedding } from "./i-embedding";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

const openai = new OpenAIApi(config);

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function downloadFile(url: string): Promise<string> {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.createEmbedding({
    input: text,
    model: "text-embedding-ada-002",
  });

  return response.data.data[0].embedding;
}

async function processGithubRepo(repoUrl: string): Promise<void> {
  try {
    const exclude_dirs = [".git", "node_modules", "public", "assets", "static"];
    const exclude_files = ["package-lock.json", ".DS_Store", "yarn.lock"];

    const loader = new GithubRepoLoader(repoUrl, {
      branch: "main",
      accessToken: process.env.GITHUB_TOKEN,
      recursive: true,
      unknown: "warn",
      ignoreFiles: [
        "*.png",
        "*.jpg",
        "*.jpeg",
        "*.gif",
        "*.bmp",
        "*.tiff",
        "*.ico",
        "*.svg",
        "*.webp",
        "*.mp3",
        "*.wav",
        ...exclude_dirs,
        ...exclude_files,
      ],
    });

    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 2000,
      chunkOverlap: 200,
    });

    const docs = await loader.load();
    const documents: string[] = [];

    for (const doc of docs) {
      const source = doc.metadata.source;
      const source2 = source.split("/").slice(1).join("/");

      if (doc?.pageContent) {
        doc.pageContent = `FILE NAME: ${source2}\n###\n${doc.pageContent.replace("\u0000", "")}`;

        documents.push(doc.pageContent);
      }
    }

    const output = await splitter.createDocuments(documents);
    
    console.log(output);

    fs.writeFileSync("embeddings.json", JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Error processing GitHub repository:", error);
  }
}

const repoUrl = "https://github.com/Vheissu/cortex-device-list";
processGithubRepo(repoUrl);

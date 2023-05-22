import * as dotenv from "dotenv";
dotenv.config();

import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

const vectorPath = `vectors`;

export async function processGithubRepo(repoUrl: string, openaiApiKey: string = null, githubApiKey: string = null): Promise<void> {
  openaiApiKey = openaiApiKey || process.env.OPENAI_API_KEY;
  githubApiKey = githubApiKey || process.env.GITHUB_TOKEN;

  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openaiApiKey,
    });
    
    const model = new OpenAI({
      openAIApiKey: openaiApiKey,
    });

    const exclude_ext = [
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
    ];
    const exclude_dirs = [
      ".git",
      ".vscode",
      ".github",
      ".circleci",
      ".husky",
      "node_modules",
      "public",
      "assets",
      "static",
    ];
    const exclude_files = [
      "package-lock.json",
      ".DS_Store",
      "yarn.lock",
      ".gitignore",
    ];

    const loader = new GithubRepoLoader(repoUrl, {
      branch: "main",
      accessToken: githubApiKey,
      recursive: true,
      unknown: "warn",
      ignoreFiles: [...exclude_ext, ...exclude_dirs, ...exclude_files],
    });

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });

    const docs = await loader.load();

    const documents = {};

    for (const doc of docs) {
      const source = doc.metadata.source;
      const source2 = source.split("/").slice(1).join("/");

      if (doc?.pageContent) {
        doc.pageContent = doc.pageContent.replace("\u0000", "");

        if (!documents[source2]) {
          documents[source2] = [];
        }

        documents[source2].push(doc);
      }
    }

    const output = [];
    for (const key in documents) {
      const docs = documents[key];
      const output2 = await splitter.splitDocuments(docs);
      output.push(...output2);
    }

    const vectorStore = await HNSWLib.fromDocuments(output, embeddings);
    await vectorStore.save(vectorPath);
  } catch (error) {
    console.error("Error processing GitHub repository:", error);
  }
}
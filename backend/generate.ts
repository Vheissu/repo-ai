import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text: string): Promise<number[]> {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
}

async function processGithubRepo(repoUrl: string): Promise<void> {
  try {
    const exclude_ext = ["*.png", "*.jpg", "*.jpeg", "*.gif", "*.bmp", "*.tiff", "*.ico", "*.svg", "*.webp", "*.mp3", "*.wav"];
    const exclude_dirs = [".git", ".vscode", ".github", ".circleci", ".husky", "node_modules", "public", "assets", "static"];
    const exclude_files = ["package-lock.json", ".DS_Store", "yarn.lock", ".gitignore"];

    const loader = new GithubRepoLoader(repoUrl, {
      branch: "master",
      accessToken: process.env.GITHUB_TOKEN,
      recursive: true,
      unknown: "warn",
      ignoreFiles: [
        ...exclude_ext,
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

    const documents = {};

    for (const doc of docs) {
      const source = doc.metadata.source;
      const source2 = source.split("/").slice(1).join("/");

      if (doc?.pageContent) {
        doc.pageContent = doc.pageContent.replace("\u0000", "");

        const embedding = await getEmbedding(doc.pageContent);
        doc.metadata.embedding = embedding;

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

    fs.writeFileSync("embeddings.json", JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Error processing GitHub repository:", error);
  }
}

const repoUrl = "https://github.com/aurelia/aurelia";
processGithubRepo(repoUrl);

export interface IEmbedding {
    fileName: string;
    content: string;
    tokens: number;
    rawFileUrl: string;
    chunkId: number;
    embedding: number[];
}
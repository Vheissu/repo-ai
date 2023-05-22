import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';
import { processGithubRepo } from './generate';
import { search } from './search';

const app = new Koa();
const router = new Router();

app.use(cors());

router.post('/process', async (ctx, next) => {
  let repoUrl = ctx.request.body.repoUrl;

  const openaiApiKey = ctx.request.headers.openaiapikey || process.env.OPENAI_API_KEY;
  const githubApiKey = ctx.request.headers.githubapikey || process.env.GITHUB_TOKEN;


  if (!repoUrl) {
    ctx.status = 400;
    ctx.body = { error: 'Missing repoUrl' };
    return;
  }
  
  try {
    await processGithubRepo(repoUrl, openaiApiKey, githubApiKey);
    ctx.status = 200;
    ctx.body = { status: 'success' };
  } catch (error) {
    console.error('Error processing GitHub repository:', error);
    ctx.status = 500;
    ctx.body = { error: 'Error processing GitHub repository' };
  }
});

router.get('/ask/:question', async (ctx, next) => {
    let question = ctx.params.question;

    if (!question) {
        ctx.status = 400;
        ctx.body = { error: 'Missing question' };
        return;
    }

    try {
        const res = await search(question);
        ctx.status = 200;
        ctx.body = { answer: res };
    } catch (error) {
        console.error('Error searching:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error searching' };
    }
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);

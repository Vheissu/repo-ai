import { HttpClient } from "@aurelia/fetch-client";
import { newInstanceForScope } from "@aurelia/kernel";

export class RepoAi {
  private question = "";
  private response = "";
  private loading = false;
  private opened = false;

  constructor(@newInstanceForScope(HttpClient) private http: HttpClient) {
    this.http.configure((config) => {
      return config
        .useStandardConfiguration()
        .withBaseUrl("http://localhost:3000");
    });
  }

  private async ask() {
    try {
      const loadedOpenaiApiKey = localStorage.getItem('openaiApiKey');
      const loadedGithubApiKey = localStorage.getItem('githubApiKey');

      if (!loadedOpenaiApiKey) {
        this.response = "Please enter your OpenAI API key in the sidebar.";
        return;
      }

      this.response = '';

      this.loading = true;
      const response = await this.http.get(`/ask/${this.question}`, {
        headers: {
          openaiapikey: loadedOpenaiApiKey,
          githubapikey: loadedGithubApiKey
        }
      });
      const body = await response.json();
      this.typeResponse(body.answer, 0);
    } catch (error) {
      this.loading = false;
      console.error("Error asking:", error);
    }
  }

  private typeResponse(response: string, i: number) {
    if (i < response.length) {
      this.response += response.charAt(i);
      setTimeout(() => this.typeResponse(response, i + 1), 80);
    } else {
      this.loading = false;
    }
  }

  private keyPressed(which: number) {
    if (which === 13) {
      this.ask();
    }

    return true;
  }
}

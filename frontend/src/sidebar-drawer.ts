import { BindingMode, bindable } from "aurelia";

export class SidebarDrawer {
    private apikey1: HTMLInputElement;
    private apikey2: HTMLInputElement;

    @bindable({ mode: BindingMode.twoWay }) private opened = false;

    attached() {
        const loadedOpenaiApiKey = localStorage.getItem('openaiApiKey');
        const loadedGithubApiKey = localStorage.getItem('githubApiKey');

        if (loadedOpenaiApiKey) {
            this.apikey1.value = loadedOpenaiApiKey;
        }

        if (loadedGithubApiKey) {
            this.apikey2.value = loadedGithubApiKey;
        }
    }

    private closeNav() {
        this.opened = false;
    }

    private toggleVisibility(fieldRef) {
        if (fieldRef === 'apikey1') {
            this.apikey1.type = this.apikey1.type === 'password' ? 'text' : 'password';
        } else if (fieldRef === 'apikey2') {
            this.apikey2.type = this.apikey2.type === 'password' ? 'text' : 'password';
        }
    }

    private saveApiKeys() {
        const openaiApiKey = this.apikey1.value;
        const githubApiKey = this.apikey2.value;

        if (openaiApiKey) {
            localStorage.setItem('openaiApiKey', openaiApiKey);
        }

        if (githubApiKey) {
            localStorage.setItem('githubApiKey', githubApiKey);
        }

        if (openaiApiKey || githubApiKey) {
            this.apikey1.type = 'password';
            this.apikey2.type = 'password';
        }
    }
}
import { Renderer2 } from '@angular/core';

export class ScriptService {

    constructor() { }


    loadJsScript(renderer: Renderer2, src: string): HTMLScriptElement {
        const script = renderer.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        return script;
    }
}

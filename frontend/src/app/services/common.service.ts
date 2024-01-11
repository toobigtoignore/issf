import { EventEmitter, Injectable } from '@angular/core';


@Injectable()


export class CommonServices {
    scopeEmitter = new EventEmitter<string>();
    updateEmitter = new EventEmitter<{status_code: number, message: string}>();


    constructor() { }
}

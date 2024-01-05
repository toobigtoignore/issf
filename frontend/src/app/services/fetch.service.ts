import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';


@Injectable()


export class FetchingServices {
    httpHeaders = new HttpHeaders({ 
        'Content-Type': 'application/json',
        'Authorization': 'Basic dGJ0aTpXaU5jVHY4YWo0WiVHNiRzMUl3bHUyRlg='
     });


    constructor(){ }
}
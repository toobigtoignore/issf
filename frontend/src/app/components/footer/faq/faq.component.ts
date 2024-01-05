import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'app-faq',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css']
})


export class FAQComponent implements OnInit {

    constructor() { }


    ngOnInit(): void {
    }

 
    scrollToElement(element: Element): void {
        element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }
}
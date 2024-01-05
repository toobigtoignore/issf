import { Component, Input, OnInit } from '@angular/core';
import { SPECIES_LINKS_TYPES, URL_OPTIONS } from '../../../constants/constants';


@Component({
    selector: 'app-species-link',
    templateUrl: './species-link.component.html',
    styleUrls: ['./species-link.component.css']
})


export class SpeciesLinkComponent implements OnInit {
    @Input() label1: string;
    @Input() label2: string;
    @Input() field1: string;
    @Input() field2: string;
    @Input() values: any;
    @Input() field1Type: string;
    optionValues: string[] = URL_OPTIONS;
    types: SPECIES_LINKS_TYPES = SPECIES_LINKS_TYPES;
    

    constructor() { }

    
    ngOnInit(): void {
        if(this.values?.length === 0){
            if(this.field1Type === this.types['SELECT']){
                // External link type
                // expects the values to be received in this format
                this.values = [{link_type: this.optionValues[0], link_address: ''}]
            }
            if(this.field1Type === this.types['INPUT']){
                // Species type
                // expects the values to be received in this format
                this.values = [['', '']]
            }
            
        }
    }


    onAddAnother(event: Event){
        const el = event.target as HTMLElement;
        const tr = (el.closest('table') as HTMLElement).querySelector('tbody').lastElementChild;
        tr.insertAdjacentHTML("afterend", tr.innerHTML);
        tr.nextElementSibling.lastElementChild.addEventListener('click', (event) => this.onRemoveSection(event));
    }


    onRemoveSection(event: Event){
        const el = event.target as HTMLElement;
        el.closest('tr').remove();
    }
}
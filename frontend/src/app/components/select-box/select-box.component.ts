import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FormControl} from '@angular/forms';


@Component({
    selector: 'app-select-box',
    templateUrl: './select-box.component.html',
    styleUrls: ['./select-box.component.css']
})


export class SelectBoxComponent implements OnInit {
    @Input() list: any[];
    @Input() optionLabel: string;
    @Input() optionValue: string;
    @Input() iconKey: string;
    @Input() isMultiple: boolean;
    @Input() selectedValue: any;
    @Input() emptyValue: string;
    @Output() selectBoxUpdated = new EventEmitter<any>();
    items = new FormControl();


    constructor() { }


    ngOnInit(): void {
        if(this.emptyValue){
          this.list = [{
                optionValue: '',
                label: this.emptyValue
              },
              ...this.list
          ];
        }
        if(this.isMultiple){
            this.selectedValue = [];
            this.selectedValue.push(this.list[0][this.optionValue])
        }
        else{
            if(!this.selectedValue) {
                this.selectedValue = this.list[0][this.optionValue];
            }
        }
    }


    getOptionValue() {
        this.selectBoxUpdated.emit({
            value: this.selectedValue
        });
   }
}

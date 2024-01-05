import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
    selector: 'app-combo-box',
    templateUrl: './combo-box.component.html',
    styleUrls: ['./combo-box.component.css']
})


export class ComboBoxComponent implements OnChanges, OnInit {
    @Input() list: any[];
    @Input() optionLabel: string;
    @Input() optionValue: string;
    @Input() iconKey: string;
    @Input() boxLabel: string;
    @Output() comboBoxUpdated = new EventEmitter<any>(); 
    @ViewChild('comboInput') comboInput: ElementRef; 

    initialPlaceholder: string;
    placeholderValue: string;
    selectedOption: string;
    selectedValues: string[] = [];
    inputCtrl = new FormControl();
    filtered: Observable<any[]>;

    
    constructor() { 
        this.filtered = 
        this.inputCtrl
            .valueChanges
            .pipe(startWith(''), map(item => item ? this.filterItem(item) : this.list.slice()));
    }

    
    ngOnInit(): void { 
        this.initialPlaceholder = this.boxLabel;
    }

    
    ngOnChanges(): void {
        this.selectedOption = this.boxLabel;
        this.placeholderValue = this.boxLabel;
    }


    private filterItem(value: string): any[] {
        const filterValue = value.toString().toLowerCase();
        const optionLabel = this.optionLabel;
        return this.list.filter(item => item[optionLabel].toLowerCase().includes(filterValue));
   }


    onFocusOut(){
        // let newVal = '';
        // this.selectedValues.map((val)=> newVal += val + ', ');
        // this.placeholderValue = newVal.slice(0, -2);
        this.placeholderValue = this.initialPlaceholder;
        this.comboInput.nativeElement.value = '';
        this.comboInput.nativeElement.blur();
    }


    getOptionValue(optionValue: any) {
        this.list.map(item=>{
            if(item[this.optionValue] === optionValue){
                this.selectedOption = item[this.optionLabel];
            }
        });

        this.comboBoxUpdated.emit({
            label: this.selectedOption,
            value: optionValue 
        });
        this.selectedValues.push(this.selectedOption);
        this.onFocusOut();
   }
}
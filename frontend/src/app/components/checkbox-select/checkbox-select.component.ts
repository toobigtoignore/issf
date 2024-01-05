import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
    selector: 'app-checkbox-select',
    templateUrl: './checkbox-select.component.html',
    styleUrls: ['./checkbox-select.component.css']
})


export class CheckboxSelect implements OnInit {
    @Input() list: string[];
    @Input() boxLabel: string;
    listControlller = new FormControl('');
    @Output() selectedValues = new EventEmitter<any>();


    constructor() {}


    ngOnInit(): void {}


    onSelection(){
        this.selectedValues.emit(this.listControlller.value);
    }
}

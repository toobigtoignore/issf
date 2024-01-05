import { environment } from '../../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { PANEL_CODES } from '../../../constants/constants';


@Component({
    selector: 'app-panel-based-component',
    templateUrl: './panel-based-component.component.html',
    styleUrls: ['./panel-based-component.component.css']
})


export class PanelBasedComponentComponent implements OnInit {
    @Input() panel: string;
    @Input() panelColor: string;
    @Input() data: any;
    panelsList: {};
    showBluejusticePanel: boolean;
    showProfilePanel: boolean;
    imageUrl: string = environment.IMAGE_URL;


    constructor() { }


    ngOnInit(): void {
        this.panelsList = PANEL_CODES;
        this.showBluejusticePanel = (this.panel === this.panelsList['BLUEJUSTICE']) && (this.data.img_url || this.data.bluejustice_pdf);
        this.showProfilePanel = this.panel == this.panelsList['PROFILE'];
    }
}

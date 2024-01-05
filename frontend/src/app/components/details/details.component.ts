import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Contents } from '../../services/contents.service';
import { AuthServices } from '../../services/auth.service';
import { getGeographicInfo } from '../../helpers/geoScopeDetailsHelpers';
import { getColorForPanel, getPanelSections, getRecordDetailsUrl, getRecordName } from '../../helpers/helpers';
import { getGeoScopeDetailsInfo } from '../../../assets/js/types';
import { get } from '../../helpers/apiCalls';
import { getUserId } from '../../helpers/helpers';
import {
    JWT_TOKENS,
    PANEL_CODES,
    RESPONSE_CODES
} from '../../constants/constants';
import { getUserUrl } from '../../constants/api';
import { PostServices } from '../../services/post.service';


@Component({
	selector: 'app-details',
	templateUrl: './details.component.html',
	styleUrls: ['./details.component.css']
})


export class DetailsComponent implements OnInit {
    @ViewChild('accordionContainer') accordionContainer: ElementRef;
    @ViewChild('mapSection') mapSection: ElementRef;

    accordions: string[];
    activeBlock: number;
    contributorId: number;
    editorId: number;
    isStaff: boolean;
    geoScopeDetailsLabels: string[];
    geoScopeParams: getGeoScopeDetailsInfo;
    geoScopeLabels: string[];
    geoScopeValues: string[];
    recordId: number;
    panel: string;
    panelHeader: string;
    panelsList: PANEL_CODES;
    paramsSubscription: Params;
    recordData: any;
    recordName: string;
    userId: number;


    constructor(
        private authServices: AuthServices,
        private contents: Contents,
        private postServices: PostServices,
        private renderer: Renderer2,
        private route: ActivatedRoute,
        private router: Router
    ) { }


    async ngOnInit(): Promise<void> {
        this.paramsSubscription = this.route.params.subscribe((params: Params) => {
            this.panel = params['panel'].toString();
            this.panelHeader = this.contents.getPanelLabelFromCode(this.panel);
            this.recordId = parseInt(params['recordId']);
        });
        this.accordions = getPanelSections(this.panel);
        this.activeBlock = 0;
        this.panelsList = PANEL_CODES;
        this.recordName = 'Loading ... ';

        this.recordData = await get(getRecordDetailsUrl(this.panel, this.recordId));
        if(!this.recordData){
            this.router.navigate(['/404'], { skipLocationChange: true });
        }

        this.contributorId = this.recordData.core.contributor_id;
        this.editorId = this.recordData.core.editor_id;
        this.recordName = getRecordName(this.recordData, this.panel);
        this.geoScopeParams = {
            activeBlock: this.activeBlock,
            data: this.recordData.geoscope,
            mapSection: this.mapSection,
            panel: this.panel,
            renderer: this.renderer
        }
        this.setGeographicScopeView();


        if(this.authServices.isLoggedIn()){
            this.userId = getUserId(localStorage.getItem(JWT_TOKENS.ACCESS));
            const userInfo = await get(getUserUrl(this.userId));
            this.isStaff = userInfo.is_staff;
        }
    }


    ngOnDestroy() {
        this.paramsSubscription.unsubscribe();
    }


    async deleteRecord() {
        if(confirm('Are you sure you want to delete this record? Once deleted, it cannot be undone.')){
            if(this.authServices.isLoggedIn()){
                this.postServices
                    .deleteRecord(this.recordId)
                    .subscribe(response => {
                        const statusCode = parseInt(response.status_code);
                        if(statusCode === RESPONSE_CODES.HTTP_200_OK){
                            document.getElementById('delete-modal').style.top = '0';
                        }
                        else alert("Something went wrong while trying to delete the record");
                });
            }
            else alert("Credentials has expired. Please login and try again");
        }
    }


    getPanelColor(panel: string): string {
        return getColorForPanel(panel)
    }


    isEditor(): boolean {
        return this.contributorId === this.userId || this.editorId === this.userId || this.isStaff;
    }


    isTypeGlobalOrNs(value: any): boolean {
        if (typeof value === 'string' || value instanceof String) return true;
        return false;
    }


    navigateToEditRecord(): void {
        this.router.navigate(['/update', this.panel, this.recordId]);
    }


    setGeographicScopeView(): void {
        const { geoScopeLabels, geoScopeDetailsLabels, geoScopeValues } = getGeographicInfo(this.geoScopeParams, this.recordData.core.geographic_scope_type);
        this.geoScopeLabels = geoScopeLabels;
        this.geoScopeDetailsLabels = geoScopeDetailsLabels;
        this.geoScopeValues = geoScopeValues;
    }


    toggleAccordion(event: Event): void {
        const element = event.target as HTMLElement;
        const accordionEl = element.nextElementSibling as HTMLElement;
        element.classList.toggle('active');
        accordionEl.classList.toggle('active-accordion');

        element.classList.contains('active')
            ? element.style.backgroundColor = this.getPanelColor(this.panel)
            : element.style.backgroundColor = 'transparent'

        accordionEl.classList.contains('active-accordion')
            ? accordionEl.style.maxHeight = accordionEl.scrollHeight + 'px'
            : accordionEl.style.maxHeight = '0'
    }


    updateActiveBlock(blockNumber: number): void {
        this.activeBlock = blockNumber;
        this.geoScopeParams.activeBlock = blockNumber;
        this.setGeographicScopeView();
    }
}

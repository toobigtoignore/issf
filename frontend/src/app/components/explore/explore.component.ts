import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Contents } from '../../services/contents.service';
import { get } from '../../helpers/apiCalls';
import { getBluejusticeVisualizationUrl, getGearVisualizationUrl, getGovernanceVisualizationUrl, getMarketShareVisualizationUrl, getResearchVisualizationUrl, getSotaVisualizationUrl, getWiwVisualizationUrl } from '../../constants/api';
import * as d3 from 'd3';


@Component({
    selector: 'app-explore',
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.css']
})


export class ExploreComponent implements OnInit {
    id: number;
    govmodesData: any;
    gearData: any;
    bluejusticeData: any;
    sotaData: any;
    mshareData: any;
    wiwData: any;
    researchData: any;
    slides: Object[];


    constructor(
        private route: ActivatedRoute,
        private visThumbContent: Contents
    ) { }


    async ngOnInit(): Promise<void> {
        let self = this;
        this.route.paramMap.subscribe(params => {
            this.id = parseInt(params.get("visID"));
        });
        this.id = Number.isNaN(this.id) ? 1 : this.id;

        this.slides = this.visThumbContent.getVisContent();

        self.govmodesData = await get(getGovernanceVisualizationUrl);
        // d3.csv("/assets/vis/gear.csv", function(data){self.gearData = data})
        self.gearData = await get(getGearVisualizationUrl);
        self.bluejusticeData = await get(getBluejusticeVisualizationUrl);
        self.sotaData = await get(getSotaVisualizationUrl);
        self.mshareData = await get(getMarketShareVisualizationUrl);
        self.wiwData = await get(getWiwVisualizationUrl);
        self.researchData = await get(getResearchVisualizationUrl);
    }


    updateTab(tabID: number){
        this.id = tabID;
    }
}

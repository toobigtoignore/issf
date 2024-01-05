import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Contents } from '../../services/contents.service';
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


    ngOnInit(): void {
        let self = this;
        this.route.paramMap.subscribe(params => {
            this.id = parseInt(params.get("visID"));
        });
        this.id = Number.isNaN(this.id) ? 1 : this.id;

        this.slides = this.visThumbContent.getVisContent();

        d3.csv("/assets/vis/govmodes.csv", function(data){self.govmodesData = data;})
        d3.csv("/assets/vis/gear.csv", function(data){self.gearData = data})
        d3.csv("/assets/vis/bluejustice.csv", function(data){self.bluejusticeData = data})
        d3.csv("/assets/vis/sota.csv", function(data){self.sotaData = data})
        d3.csv("/assets/vis/mshare.csv", function(data){self.mshareData = data})
        d3.csv("/assets/vis/wiw.csv", function(data){self.wiwData = data})
        d3.csv("/assets/vis/research.csv", function(data){self.researchData = data})
    }


    updateTab(tabID: number){
        this.id = tabID;
    }
}
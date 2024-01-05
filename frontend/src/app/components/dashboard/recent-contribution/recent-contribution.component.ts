import { Component, OnInit } from '@angular/core';
import { get } from '../../../helpers/apiCalls';
import { Contents } from '../../../services/contents.service';
import { getRecentContributionsUrl } from '../../../constants/api';


@Component({
	selector: 'app-recent-contribution',
	templateUrl: './recent-contribution.component.html',
	styleUrls: ['./recent-contribution.component.css']
})


export class RecentContributionComponent implements OnInit {
    currentTab: String = "recent_contributions";
    tabs = [
        { key: 'recent_contributions', title: 'Recent Contributions' },
        { key: 'recent_contributions_by_type', title: 'Contributions By Type' },
        { key: 'top_contributors', title: 'Top Contributors' }
    ]
    tabsContent: any;


    constructor(private contents: Contents) { }


    async ngOnInit(): Promise<void> {
        this.tabsContent = await get(getRecentContributionsUrl);
    }


    adjustLineBreak(line: string){
        let formattedLine: string = '';
        const parts = line.split('<strong>');
        let index = 1;
        while(index < parts.length){
            formattedLine += '<strong>' + parts[index] + '<br />';
            index++;
        }
        return formattedLine;
    }


    getPanelCodeFromLabel(label: string) {
        return this.contents.getPanelCodeFromLabel(label);
    }


    getPanelIconFromLabel(label: string) {
        return this.contents.getPanelIconFromLabel(label);
    }


    onTabTriggerClicked(key:String) {
        this.currentTab = key;
    }
}

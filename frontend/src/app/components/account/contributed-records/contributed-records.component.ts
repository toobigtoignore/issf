import { Component, Input, OnInit } from '@angular/core';
import { Contents } from '../../../services/contents.service';
import { MatTableDataSource } from '@angular/material/table';
import { filterTable } from '../../../helpers/helpers';


@Component({
	selector: 'app-contributed-records',
	templateUrl: './contributed-records.component.html',
	styleUrls: ['./contributed-records.component.css']
})


export class ContributedRecords implements OnInit {
    @Input() usersContributions: any;
    recordColumns = ['recordName'];
    dataSource: any;
    activeTab: string;
    tabType: {
        contributor: string,
        editor: string
    };


    constructor(private contents: Contents) { }


    ngOnInit(): void {
        this.tabType = {
            contributor: 'contributor',
            editor: 'editor'
        };
        this.activeTab = this.tabType.contributor;
        this.dataSource = new MatTableDataSource(this.usersContributions.contributor_data);
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


    fetchLink(recordType: string, recordId: number){
        const panelCode = this.contents.getPanelCodeFromLabel(recordType);
        const link = `/details/${panelCode}/${recordId}`;
        return link;
    }


    filterTable(event: Event) {
        filterTable(event, this.dataSource);
    }


    onTriggerUpdate(tabType: string){
        this.activeTab = tabType;
        switch(tabType){
            case this.tabType.contributor: {
                this.dataSource = new MatTableDataSource(this.usersContributions.contributor_data);
                break;
            }
            case this.tabType.editor: {
                this.dataSource = new MatTableDataSource(this.usersContributions.editor_data);
                break;
            }
        }
    }
}

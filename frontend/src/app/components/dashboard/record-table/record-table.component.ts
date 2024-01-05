import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Contents } from '../../../services/contents.service';
import { filterTable } from '../../../helpers/helpers';


@Component({
    selector: 'app-record-table',
    templateUrl: './record-table.component.html',
    styleUrls: ['./record-table.component.css']
})


export class RecordTableComponent implements AfterViewInit, OnChanges, OnInit {
    @Input() tableData: any;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    noRecordsFound: boolean = false;
    displayedColumns: string[] = ['recordType', 'description', 'date'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    initialLoad: boolean = false;


    constructor(private contents: Contents) { }


    ngOnChanges(changes: SimpleChanges) {
        if(!changes.tableData.firstChange){
            this.dataSource.data = changes.tableData.currentValue;
        }
    }


    ngOnInit(): void {}


    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.data = this.tableData;
        this.noRecordsFound = this.dataSource.data.length === 0;
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


    capitalize(word: string){
        return word.charAt(0).toUpperCase() + word.slice(1);
    }


    filterTable(event: Event) {
        filterTable(event, this.dataSource);
    }


    getPanelCodeFromLabel(recordType: string){
        return this.contents.getPanelCodeFromLabel(recordType);
    }
}

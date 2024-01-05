import { Component, Input, OnInit } from '@angular/core';
import { DETAILS_ACCORDIONS_LABELS, THEME_ISSUES_CATEGORIES } from '../../../constants/constants';
import { FormatterServices } from '../../../services/formatter.service';


@Component({
    selector: 'app-sota-details',
    templateUrl: './sota-details.component.html',
    styleUrls: ['./sota-details.component.css']
})


export class SotaDetailsComponent implements OnInit {
      @Input() accordion: string;
      @Input() record: any;
      theme_issues_categories: THEME_ISSUES_CATEGORIES;
      accordionList: string[];
      sotaData: any;


      constructor(private formatterServices: FormatterServices) { }


      ngOnInit(): void {
          this.accordionList = DETAILS_ACCORDIONS_LABELS.SOTA;
          this.sotaData = this.record;
          this.theme_issues_categories = THEME_ISSUES_CATEGORIES;
      }


      getContributorName(){
          return this.sotaData?.core?.user?.first_name + ' ' + this.sotaData?.core?.user?.last_name;
      }


      getFormattedDate(date: string, delimiter: string): string {
          return this.formatterServices.formatDate(date, delimiter);
      }


      getPublicationType(){
          if(this.sotaData.publication_type_id === 9){
              return this.sotaData.other_publication_type;
          }
          return this.sotaData.publication?.publication_type;
      }


      lnToBr(value: any){
          if(value) return value.replaceAll('\n','<br>')
          return value;
      }
}

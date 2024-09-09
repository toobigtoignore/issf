import { Component, OnInit } from '@angular/core';
import { Contents } from '../../../../services/contents.service';


@Component({
	selector: 'app-grid-visuals',
	templateUrl: './grid-visuals.component.html',
	styleUrls: ['./grid-visuals.component.css']
})


export class GridVisualsComponent implements OnInit {
  	currentSlide = 0;
    sections: Array<Object[]> = [];
  	prevDisabled: boolean = true;
  	nextDisabled: boolean = false;


    constructor(private visThumbContent: Contents) { }


    ngOnInit(): void {
        this.sections = this.visThumbContent.getContentForGallery();
    }


	onPreviousClick() {
		const previous = this.currentSlide - 1;
		this.currentSlide = previous < 0 ?  this.currentSlide : previous;
		this.prevDisabled = this.currentSlide <= 0 ?  true : false;
		this.nextDisabled = false;
	}


	onNextClick() {
		const next = this.currentSlide + 1;
		this.currentSlide = next === this.sections.length ? this.currentSlide : next;
		this.nextDisabled = this.currentSlide === this.sections.length - 1 ? true : false;
		this.prevDisabled = false;
	}
}

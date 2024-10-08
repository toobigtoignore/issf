import { Component, Input, OnInit } from '@angular/core';
import { Contents } from '../../../services/contents.service';


@Component({
    selector: 'app-visual-gallery',
	  templateUrl: './visual-gallery.component.html',
	  styleUrls: ['./visual-gallery.component.css']
})


export class VisualGalleryComponent implements OnInit {
    @Input() records: any;
    allSlides: Object[] = [];


    constructor(private contents: Contents) { }


    ngOnInit(): void {
        this.allSlides = this.contents.getVisContent();
    }
}

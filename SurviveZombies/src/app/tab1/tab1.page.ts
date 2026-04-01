import { Component } from '@angular/core';
import { IonButton, IonList, IonItem, IonSegmentContent, IonSegmentView,
          IonLabel, IonSegment, IonSegmentButton, IonHeader,
          IonToolbar, IonTitle, IonContent, IonBadge, IonInput } from '@ionic/angular/standalone';

import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface Item  {
  name: string;
  qty: number;
  desc?: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    ExploreContainerComponent, IonLabel, IonSegment,
    IonSegmentButton, RouterLink, IonSegmentView,
    IonSegmentContent, IonList, IonItem, IonBadge, IonInput, IonButton],
})

export class Tab1Page {
  constructor() {}

  itemName: string = "";
  itemQty: number = 0;
  itemDesc: string = "";

  items: Item[] = [
  ];
  itemCount:number = this.items.length;

  addToStock = () => {
    this.items.push({"name": this.itemName, "qty": this.itemQty, "desc": this.itemDesc});    
    this.itemCount++;
  }
}

import { Component } from '@angular/core';
import { IonButton, IonList, IonItem, IonSegmentContent, IonSegmentView,
          IonLabel, IonSegment, IonSegmentButton, IonHeader,
          IonToolbar, IonTitle, IonContent, IonBadge, IonInput, IonText, IonAlert } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import type { OverlayEventDetail } from '@ionic/core';


export interface Item  {
  name: string;
  qty: number;
  desc?: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonAlert, IonText, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonSegment,
    IonSegmentButton, IonSegmentView,
    IonSegmentContent, IonList, IonItem, IonBadge, IonInput, IonButton ],
})

export class Tab1Page {
  constructor() {}

  alertButtons = ['OK'];
  itemName: string = "No name provided";
  itemQty: number = 1;
  itemDesc?: string = "No description provided";
  quantityAlert: boolean = false;

  items: Item[] = [
  ];
  itemCount:number = this.items.length;

  addToStock = () => {
    if (this.itemQty <= 0) {
      this.quantityAlert = true;
      return;
    }
    this.items.push({"name": this.itemName, "qty": this.itemQty, "desc": this.itemDesc});    
    this.itemCount++;
  }

  setResult(event: CustomEvent<OverlayEventDetail>) {
    this.quantityAlert = false;
  }
}

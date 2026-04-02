import { Component } from '@angular/core';
import { IonButton, IonList, IonItem, IonSegmentContent, IonSegmentView,
          IonLabel, IonSegment, IonSegmentButton, IonHeader,
          IonToolbar, IonTitle, IonContent, IonInput, IonText,
          IonAlert, IonModal, IonButtons } from '@ionic/angular/standalone';
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
  imports: [IonAlert, IonText, FormsModule, IonHeader,
    IonContent, IonLabel, IonSegment,
    IonSegmentButton, IonSegmentView,
    IonSegmentContent, IonList, IonItem, IonInput,
    IonButton, IonModal, IonButtons, IonToolbar, IonTitle],
})

export class Tab1Page {
  constructor() {}

  alertButtons = ['OK'];
  itemName: string = "No name provided";
  itemQty: number = 1;
  itemDesc?: string = "No description provided";
  isQuantityAlert: boolean = false;
  isItemModalOpen: boolean = false;
  isEditingItem: boolean = false;
  activeItem: Item = {"name": "", "qty": 0, "desc": ""};
  items: Item[] = [];
  itemCount:number = this.items.length;

  addToStock = () => {
    if (this.itemQty <= 0) {
      this.isQuantityAlert = true;
      return;
    }
    this.items.push({"name": this.itemName, "qty": this.itemQty, "desc": this.itemDesc});    
    this.itemCount++;
  }

  setResult = () => {
    this.isQuantityAlert = false;
  }

  openItemModal = (selectedItem: Item) => {
    this.activeItem = selectedItem;
    this.isItemModalOpen = true;
  }

  closeItemModal = () => {
    this.isItemModalOpen = false;
    
    setTimeout(() => {
      this.isEditingItem = false;
    }, 200);  }

  removeItem = () => {
    this.items = this.items.filter(item => item !== this.activeItem);
    this.itemCount = this.items.length;
    this.closeItemModal();
  }

  editDetails = () => {
    this.isEditingItem = !this.isEditingItem;
  }
}

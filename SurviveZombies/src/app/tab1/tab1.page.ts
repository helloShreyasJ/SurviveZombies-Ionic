import { Component } from '@angular/core';
import { IonButton, IonList, IonItem, IonSegmentContent, IonSegmentView,
          IonLabel, IonSegment, IonSegmentButton, IonHeader,
          IonToolbar, IonContent, IonInput, IonText,
          IonAlert, IonModal, IonButtons, IonSearchbar } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';

export interface Item  {
  name: string;
  qty: number;
  desc?: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonSearchbar, IonAlert, IonText, FormsModule, IonHeader,
    IonContent, IonLabel, IonSegment,
    IonSegmentButton, IonSegmentView,
    IonSegmentContent, IonList, IonItem, IonInput,
    IonButton, IonModal, IonButtons, IonToolbar],
})

export class Tab1Page {
  constructor(private storage: Storage) {}

  alertButtons = ['OK'];
  itemName: string = "No name provided";
  itemQty: number = 1;
  itemDesc?: string = "No description provided";
  isQuantityAlert: boolean = false;
  isItemModalOpen: boolean = false;
  isEditingItem: boolean = false;
  activeItem: Item = {"name": "", "qty": 0, "desc": ""};
  items: Item[] = [];
  filteredItems: Item[] = [];
  itemCount:number = this.items.length;

  async ngOnInit() {
    await this.storage.create();
    await this.loadInventory(); 
  }

  addToStock = () => {
    if (this.itemQty <= 0) {
      this.isQuantityAlert = true;
      return;
    }
    this.items.push({"name": this.itemName, "qty": this.itemQty, "desc": this.itemDesc});    
    this.filteredItems = this.items;
    this.itemCount++;
    this.saveInventory();
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
    }, 200);
    this.saveInventory();
  }

  removeItem = () => {
    this.items = this.items.filter(item => item !== this.activeItem);
    this.filteredItems = this.items;
    this.itemCount = this.items.length;
    this.closeItemModal();
    this.saveInventory();
  }

  editDetails = () => {
    this.isEditingItem = !this.isEditingItem;
  }

  async saveInventory() {
    await this.storage.set('items', this.items);
  }

  async loadInventory() {
    const savedItems = await this.storage.get('items');
    if (savedItems) {
      this.items = savedItems;
      this.filteredItems = this.items;
      this.itemCount = this.items.length;
    }
  }

  searchList = (event: any) => {
    const query = event.target.value.toLowerCase();

    this.filteredItems = this.items.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }
}

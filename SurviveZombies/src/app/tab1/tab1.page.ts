import { Component } from '@angular/core';
import { IonButton, IonList, IonItem, IonSegmentContent, IonSegmentView,
          IonLabel, IonSegment, IonSegmentButton, IonHeader,
          IonToolbar, IonContent, IonInput, IonText,
          IonAlert, IonModal, IonButtons, IonSearchbar, IonFabList, IonFabButton, IonIcon, IonFab } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Share } from '@capacitor/share';

export interface Item  {
  name: string;
  qty: number;
  desc?: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonFab, IonIcon, IonFabButton, IonFabList, IonSearchbar, IonAlert, IonText, FormsModule, IonHeader,
    IonContent, IonLabel, IonSegment,
    IonSegmentButton, IonSegmentView,
    IonSegmentContent, IonList, IonItem, IonInput,
    IonButton, IonModal, IonButtons, IonToolbar],
})

export class Tab1Page {
  constructor(private storage: Storage) {}

  alertButtons: string[] = ['OK'];
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
  isUserAlert: boolean = false;
  userName: string = "";
  alertInputs = [
    {
      name: 'survivorName',
      type: 'text',
      placeholder: 'Enter your name...',
    }
  ];
  shareAlertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
    },
    {
      text: 'Share',
      role: 'confirm',
    }
  ];

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
    this.items.sort((a, b) => a.name.localeCompare(b.name));
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

  saveInventory = async() => {
    this.items.sort((a, b) => a.name.localeCompare(b.name));
    await this.storage.set('items', this.items);
  }

  loadInventory = async() => {
    const savedItems = await this.storage.get('items');
    if (savedItems) {
      this.items = savedItems;
      this.items.sort((a, b) => a.name.localeCompare(b.name));
      this.filteredItems = this.items;
      this.itemCount = this.items.length;
    }
  }

  searchList = (event: any) => {
    const query = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter(item => 
      item.name.toLowerCase().startsWith(query)
    );
  }

  startShareProcess = () => {
    this.isUserAlert = true;
  }

  formatOutput = ():string => {
    let message: string = "";
    this.items.forEach(i => {
      message += `\n${i.name} (Qty: ${i.qty})\n`;
      if (i.desc) {
        message += `Notes: ${i.desc}\n`;
      }
    });
    return message;
  };

  shareDismiss = async (event: any) => {
    this.isUserAlert = false;
    if (event.detail.role === 'confirm') {      
      const typedName = event.detail.data.values.survivorName;  
      if (typedName) {
        this.userName = typedName;
      } else {
        this.userName = 'Survivor';
      }
      await this.executeShare();
    }
  }

  executeShare = async() =>{
    try {
      await Share.share({
        title: `${this.userName}'s Inventory`,
        text: this.formatOutput(),
        dialogTitle: 'Broadcast stash to survivors...',
      });
    } catch (error) {
      console.log(error);
    }
  }
}

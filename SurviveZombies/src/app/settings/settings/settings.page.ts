import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonInput, IonItem, IonIcon, IonButton, IonToggle, IonText } from '@ionic/angular/standalone';
import { add } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonText, IonToggle, IonButton, IonIcon, IonItem, IonInput, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton ]
})
export class SettingsPage implements OnInit {

  constructor(private storage: Storage) {
    addIcons({ add });
  }

  async ngOnInit() {
    await this.storage.create();
  }

  apiKey: string = "";
  isFocusedApiBox: boolean = false;

  setApiKey = async () => {
    await this.storage.set('api_key', this.apiKey);
  }

  onFocusApiBox = () => {
    this.isFocusedApiBox = true;
  }

  onBlurApiBox = async () => {
    await setTimeout(() => {
      this.isFocusedApiBox = false;
    }, 120);
  }
}

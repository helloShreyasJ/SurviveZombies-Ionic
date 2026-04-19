import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonInput, IonItem, IonIcon, IonButton, IonToggle, IonText, IonModal } from '@ionic/angular/standalone';
import { add } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Storage } from '@ionic/storage-angular';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonModal, IonText, IonToggle, IonButton, IonIcon, IonItem, IonInput, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton ]
})
export class SettingsPage implements OnInit {
  
  darkMode: boolean = false;

  constructor(private storage: Storage) {
    addIcons({ add });
  }

  async ngOnInit() {
    await this.storage.create();
    let savedTheme = await this.storage.get('dark_mode');
    this.darkMode = savedTheme;
    this.applyTheme(this.darkMode);
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

  toggleDarkMode = async () => {
    await this.storage.set('dark_mode', this.darkMode);
    this.applyTheme(this.darkMode);
  }

  applyTheme(isDark: boolean) {
    document.body.classList.toggle('ion-palette-dark', isDark);
  }
}

import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonButton, IonHeader, IonContent } from '@ionic/angular/standalone';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonContent, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class Tab2Page {

  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap: GoogleMap | undefined;

  constructor() {}
  currentLat: number = 0.000;
  currentLng: number = 0.000;

  ngAfterViewInit() { 
    this.createMap();
  } 

  createMap = async() => {
    let mapLat = 53.271;
    let mapLng = -9.063;

    try {
      let coordinates = await Geolocation.getCurrentPosition();
      mapLat = coordinates.coords.latitude;
      mapLng = coordinates.coords.longitude;
      this.currentLat = mapLat;
      this.currentLng = mapLng;
    } catch (error) { 
      console.log(error);
    }

    try {
      this.newMap = await GoogleMap.create({
        id: 'safe-zone-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.apiKey, 
        config: {
          center: {
            lat: mapLat,
            lng: mapLng,
          },
          zoom: 15,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}

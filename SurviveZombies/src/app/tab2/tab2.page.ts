import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { IonButton, IonHeader, IonContent } from '@ionic/angular/standalone';
import { GoogleMap, Marker } from '@capacitor/google-maps';
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
  map: GoogleMap | undefined;

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
      this.map = await GoogleMap.create({
        id: 'safe-zone-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.apiKey, 
        forceCreate: true,
        config: {
          center: {
            lat: mapLat,
            lng: mapLng,
          },
          zoom: 15,
        },
      });

      await this.map.setOnMapClickListener((event) => {
        const tapLat = event.latitude;
        const tapLng = event.longitude;
        
        this.addMarkers(tapLat, tapLng);
      });

    } catch (error) {
      console.log(error);
    }
  }

  addMarkers = async (markLatitude: number, markLongitude: number) => {
    if (this.map == null) return;
    await this.map.addMarker({
      coordinate: {
        lat: markLatitude,
        lng: markLongitude
      }, 
      iconUrl: 'assets/markers/benign.png'

    });
    console.log(`Pin dropped at ${markLatitude}, ${markLongitude}`);
  }
}

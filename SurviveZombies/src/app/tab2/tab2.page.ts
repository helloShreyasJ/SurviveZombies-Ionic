import { Component, ElementRef, ViewChild } from '@angular/core';
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
  markerTracker: {
    [id: string]: {
      lat: number,
      lng: number,
      state: string
    }
  } = {};

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
        // DEBUG: console.log(this.markerTracker);
      });

      await this.map.setOnMarkerClickListener(async (marker) => {
        const pinMemory = this.markerTracker[marker.markerId];

        if (!pinMemory) return;

        if (pinMemory.state == 'benign') {
          await this.map?.removeMarker(marker.markerId);
          delete this.markerTracker[marker.markerId];
        
        const newDangerId = await this.map!.addMarker({
          coordinate: {
            lat: pinMemory.lat,
            lng: pinMemory.lng
          },
            iconUrl: 'assets/markers/danger.png'
        });

        this.markerTracker[newDangerId] = {
          lat: pinMemory.lat,
          lng: pinMemory.lng,
          state: 'danger'
        };

        } else if (pinMemory.state == 'danger') {
          await this.map?.removeMarker(marker.markerId);
          delete this.markerTracker[marker.markerId];
        }
      });

    } catch (error) {
      console.log(error);
    }
  }

  addMarkers = async (markLatitude: number, markLongitude: number) => {
    if (this.map == null) return;
    const newMarkerId = await this.map.addMarker({
      coordinate: {
        lat: markLatitude,
        lng: markLongitude
      }, 
      iconUrl: 'assets/markers/benign.png',
    });

    this.markerTracker[newMarkerId] = {
      lat: markLatitude,
      lng: markLongitude,
      state: 'benign'
    };

    // DEBUG: console.log(`Pin dropped at ${markLatitude}, ${markLongitude}`);
  }
}

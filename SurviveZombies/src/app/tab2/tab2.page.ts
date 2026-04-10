import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonHeader, IonContent } from '@ionic/angular/standalone';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SafeZoneService } from '../services/safe-zone-service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [ IonHeader, IonContent ],
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
  safeZones: any[] = [];

  constructor(private service: SafeZoneService, private storage: Storage) {}
  currentLat: number = 0.000;
  currentLng: number = 0.000;

  async ngOnInit() {
    await this.storage.create();
  }

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

      await this.loadMarkers();
      await this.loadSafeZonesFromService();

      await this.map.setOnMapClickListener((mapTapped) => {
        const tapLat = mapTapped.latitude;
        const tapLng = mapTapped.longitude;
        
        this.addMarkers(tapLat, tapLng);
        // DEBUG: console.log(this.markerTracker);
      });

      await this.map.setOnMarkerClickListener(async (markerTapped) => {
        const pinMemory = this.markerTracker[markerTapped.markerId];

        if (!pinMemory) return;

        if (pinMemory.state == 'benign') {
          await this.map?.removeMarker(markerTapped.markerId);
          delete this.markerTracker[markerTapped.markerId];
        
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
        this.saveMarkers();

        } else if (pinMemory.state == 'danger') {
          await this.map?.removeMarker(markerTapped.markerId);
          delete this.markerTracker[markerTapped.markerId];
        }
        this.saveMarkers();
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

    await this.saveMarkers();
  }

  addSafeZones = async (zoneData: any[]) => {
    if (this.map == null) return;

    try {
      const newZones = zoneData.map((zone: any) => {
        return {
          center: { lat: zone.lat, lng: zone.lng }, 
          radius: zone.rad,
          fillColor: '#B2CEE7',
          strokeColor: '#3E8ACD',
          strokeWidth: 2,
          clickable: true
        }
      });

      await this.map.addCircles(newZones);
    } catch (error) {
      console.log(error);
    }
  }

  loadSafeZonesFromService = async () => {
    this.service.getSafeZoneData().subscribe(async (data) => {
      this.safeZones = data;
      console.log(this.safeZones);
      
      await this.addSafeZones(this.safeZones);
    });
  }

  saveMarkers = async () => {
    const pinArray = Object.values(this.markerTracker);
    await this.storage.set('markers', pinArray);
  }

  loadMarkers = async () => {
    const saved = await this.storage.get('markers');
    if (!saved) return;

    for (const pin of saved) {
      if (this.map == null) return;

      const id = await this.map.addMarker({
        coordinate: { lat: pin.lat, lng: pin.lng },
        iconUrl: pin.state === 'danger' ? 'assets/markers/danger.png' : 'assets/markers/benign.png'
      });
      this.markerTracker[id] = pin;
    }
  }
}

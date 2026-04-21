import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonHeader, IonContent } from '@ionic/angular/standalone';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SafeZoneService } from '../services/safe-zone-service';
import { Storage } from '@ionic/storage-angular';
import { Share } from '@capacitor/share';
import { environment } from 'src/environments/environment';

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
  currentLat: number = 0.000;
  currentLng: number = 0.000;
  darkMode: boolean = false;
  
  constructor(private service: SafeZoneService, private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    let savedTheme = await this.storage.get('dark_mode');
    this.darkMode = savedTheme;
    this.applyTheme(this.darkMode);
  }

  ngAfterViewInit() { 
    this.createMap();
  }

  async ngOnDestroy() {
    if (this.map) {
      await this.map.destroy();
      this.map = undefined;
    }
  }

  createMap = async() => {
    let apiKey = await this.storage.get('api_key'); 
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
        apiKey: apiKey, 
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
  
  applyTheme = (isDark: boolean) => {
    document.body.classList.toggle('ion-palette-dark', isDark);
  }

  formatOutput = ():string => {
    let message: string = "";
    let markers = Object.values(this.markerTracker);

    markers.forEach((pin, index) => {
      let formattedLat = pin.lat;
      let formattedLng = pin.lng;

      if (pin.state === 'danger') {
        message += `\nDanger Marker | [${formattedLat}, ${formattedLng}]\n`;
      } else {
        message += `\nBenign Marker | [${formattedLat}, ${formattedLng}]\n`;
      }
    });
    return message;
  }

  startShareProcess = async () => {
    const markerCoordinates = this.formatOutput();

    try {
      await Share.share({
        title: `Marker Coordinatates\n`,
        text: markerCoordinates,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
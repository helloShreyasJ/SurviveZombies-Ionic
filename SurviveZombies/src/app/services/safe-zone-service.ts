import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SafeZoneService {
  constructor(private httpClient: HttpClient) {}

  getSafeZoneData = ():Observable<any> => {
    return this.httpClient.get('https://gist.githubusercontent.com/helloShreyasJ/32a260f3cf0b5eaf1442c42fe981e849/raw/16c6a30e504bac782ef16fdcaf6c774369ba67e2/safe-zones.json');
  }
}

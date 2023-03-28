import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ENV } from 'src/ENV';

@Injectable()
export class FireBaseHttp {
  private BaseUrl = ENV.FIREBASE_APP_API_URL;
  private apiKey = ENV.FIREBASE_APP_API_KEY;
  private headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  async post(path: string, payload: any): Promise<any> {
    try {
      return await axios
        .post(`${this.BaseUrl}${path}?key=${this.apiKey}`, payload, {
          headers: this.headers,
        })
        .then((res) => res.data);
    } catch (err) {
      throw err;
    }
  }
}

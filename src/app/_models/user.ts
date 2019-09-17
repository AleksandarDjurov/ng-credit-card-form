import { Moment } from 'moment';

export class User {
  id: number;
  email: string;
  password: string;
  nameOnCc: string;
  ccNumber: string;
  ccExpiration: Moment;
  ccSecurityCode: string;
  token?: string;
}

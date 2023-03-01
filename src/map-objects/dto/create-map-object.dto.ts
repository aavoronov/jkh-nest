export class CreateMapObjectDto {
  name: string;
  description: string;
  category: string;
  phoneStationary: string | null;
  phoneMobile: string | null;
  website: string | null;
  latitude: string;
  longitude: string;
  address: string;
  sendToModerator: boolean;
  modComment: string | undefined;
  images: null | string[];
}

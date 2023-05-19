import { Injectable } from '@nestjs/common';
import * as Color from 'color';

@Injectable()
export class AppService {
  getHello(): string {
    // return 'Hello World!';
    const user = process.env.MAILER_USER;
    const getRandomInt = (max: number): number => {
      return Math.floor(Math.random() * max);
    };
    let randomColor, pastelColor, contrast;
    while (1) {
      randomColor = Color.rgb(
        getRandomInt(255),
        getRandomInt(255),
        getRandomInt(255),
      );
      pastelColor = randomColor.saturate(0.5).mix(Color('white'), 0.2);
      contrast = pastelColor.contrast(Color('white'));
      if (contrast > 2) break;
    }
    // const contrast = ;
    // const blackContrast = Color('black').contrast(Color('white'));
    // // console.log(pastelColor.hex());
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
    <div style='background-color:${pastelColor}; width: 100px; height: 100px'>${contrast}</div>
    </body>
    </html>`;
  }

  getFile(path: string, image: string, res: any): any {
    return res.sendFile(image, { root: `./uploads/${path}` });
  }
}

import { Injectable } from '@nestjs/common';
import { CreateMapObjectDto } from './dto/create-map-object.dto';
import { UpdateMapObjectDto } from './dto/update-map-object.dto';

@Injectable()
export class MapObjectsService {
  create(createMapObjectDto: CreateMapObjectDto) {
    return 'This action adds a new mapObject';
  }

  findAll() {
    return `This action returns all mapObjects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mapObject`;
  }

  update(id: number, updateMapObjectDto: UpdateMapObjectDto) {
    return `This action updates a #${id} mapObject`;
  }

  remove(id: number) {
    return `This action removes a #${id} mapObject`;
  }
}

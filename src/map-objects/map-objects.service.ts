import { HttpException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { CreateMapObjectDto } from './dto/create-map-object.dto';
import { MapObject } from './entities/map-object.entity';

import { writeFile } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Base64 } from 'js-base64';
import { Profile } from '../users/entities/profile.entity';
import { Verifications } from '../verifications/entities/verification.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { MapObjectDetails } from './entities/map-object-details.entity';
import { MapObjectReply } from './entities/map-object-reply.entity';
import { MapObjectReview } from './entities/map-object-review.entity';

@Injectable()
export class MapObjectsService {
  private async uploadFiles(
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    try {
      // console.log(files);
      const filenames = [];

      files.forEach((item: Express.Multer.File) => {
        let dbFileName = null;
        // // console.log(item.mimetype);

        const fileName = Base64.encodeURI(
          (Math.random() * 1000).toString() + Date.now(),
        );
        dbFileName =
          fileName +
          item.originalname.slice(item.originalname.lastIndexOf('.'));

        filenames.push(dbFileName);

        const buffer = item.buffer;
        // const myBuffer = Buffer.from(item);
        writeFile(`./uploads/map-objects/${dbFileName}`, buffer, (err) => {
          // console.log(err);
        });
      });
      return filenames;
    } catch (e) {
      // console.log(e);
    }
  }

  async getObjects() {
    try {
      const objects = await MapObject.findAll({
        attributes: ['id', 'point', 'category', 'userId', 'isApproved'],
        // limit: 1000,
      });
      // console.log(objects[0].point);
      return objects;
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getObjectsInBounds(
    lon0: string,
    lat0: string,
    lon1: string,
    lat1: string,
  ) {
    try {
      //   const query = `
      //   SELECT
      //       "id", "point", "category", "userId", "isApproved"
      //   FROM
      //       "MapObjects"
      //   WHERE
      //      point @ ST_MakeEnvelope (
      //       :lon0, :lat0, :lon1, :lat1)
      //   LIMIT 801
      // `;

      const limitedQuery = `
    SELECT
          "id", "point", "category", "userId", "isApproved"
    FROM (
          SELECT
              ROW_NUMBER() OVER (PARTITION BY category ORDER BY id) AS r,
              t.*
          FROM
              "MapObjects" t
          WHERE point @ ST_MakeEnvelope (
            :lon0, :lat0, :lon1, :lat1)) x
    WHERE
          x.r <= 100`;

      let objects = await MapObject.sequelize.query(limitedQuery, {
        replacements: {
          lon0: parseFloat(lon0),
          lat0: parseFloat(lat0),
          lon1: parseFloat(lon1),
          lat1: parseFloat(lat1),
        },

        // type: MapObjectGisTest.sequelize.QueryTypes.SELECT,
      });
      // // console.log(objects[1]);
      if (objects[0].length > 800) {
        // console.log('limited');
        objects = await MapObject.sequelize.query(limitedQuery, {
          replacements: {
            lon0: parseFloat(lon0),
            lat0: parseFloat(lat0),
            lon1: parseFloat(lon1),
            lat1: parseFloat(lat1),
          },
        });
        return { data: objects[0], status: 'limit' };
      }

      return { data: objects[0], status: 'full' };
    } catch (e) {
      // console.log('e', e);
    }
  }

  async getById(id: number) {
    try {
      const object = await MapObjectDetails.findOne({
        where: { objectId: id },
        attributes: [
          'objectId',
          'address',
          'name',
          'phoneMobile',
          'phoneStationary',
          'website',
          'description',
          'images',
        ],
        include: { model: MapObject, attributes: ['category', 'point'] },
      });

      const reviews = await MapObjectReview.findAll({
        where: { objectId: object.objectId },
        attributes: ['id', 'text', 'createdAt', 'rating'],

        include: [
          {
            model: User,
            attributes: ['id'],
            include: [
              {
                model: Profile,
                attributes: ['color', 'profilePic', 'pseudonym'],
              },
            ],
          },
          {
            model: MapObjectReply,
            as: 'replies',
            attributes: ['id', 'text', 'createdAt'],
            include: [
              {
                model: User,
                attributes: ['id'],
                include: [
                  {
                    model: Profile,
                    attributes: ['color', 'profilePic', 'pseudonym'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const count = await MapObjectReview.findAll({
        where: { objectId: object.objectId },
        attributes: ['rating'],
      });

      let rating = 0;
      count.forEach((item) => (rating += item.rating));

      // console.log(count.length ? rating / count.length : 0);

      return {
        object,
        reviews,
        rating: count.length ? rating / count.length : 0,
        count: count.length,
      };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getAround() {
    const query = `
  SELECT
      "id", "createdAt", ST_DistanceSphere(ST_MakePoint(:latitude, :longitude), "point") AS distance
  FROM
      "MapObjects"
  WHERE
  ST_DistanceSphere(ST_MakePoint(:latitude, :longitude), "point") < :maxDistance
  `;
    const latitude = '55.6';
    const longitude = '37.9';

    return await MapObject.sequelize.query(query, {
      replacements: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        maxDistance: 10 * 10000,
      },
      // type: MapObjectGisTest.sequelize.QueryTypes.SELECT,
    });
  }

  // this.getAround = function (latitude, longitude) {
  //   const query = `
  // SELECT
  //     "id", "createdAt", ST_Distance_Sphere(ST_MakePoint(:latitude, :longitude), "point") AS distance
  // FROM
  //     "SampleModels"
  // WHERE
  //     ST_Distance_Sphere(ST_MakePoint(:latitude, :longitude), "point") < :maxDistance
  // `;

  //   return model.sequelize.query(query, {
  //     replacements: {
  //       latitude: parseFloat(latitude),
  //       longitude: parseFloat(longitude),
  //       maxDistance: 10 * 1000,
  //     },
  //     type: model.sequelize.QueryTypes.SELECT,
  //   });
  // };

  async createObject(
    req: any,
    createObjectDto: CreateMapObjectDto,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const {
        name,
        description,
        category,
        phoneStationary,
        phoneMobile,
        website,
        latitude,
        longitude,
        address,
        sendToModerator,
        modComment,
      } = createObjectDto;
      // // console.log(coordinates);
      const dbFilenames = await this.uploadFiles(files);
      const images = dbFilenames.length ? dbFilenames : null;
      // console.log(images);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      // createObjectDto.images = images;

      const object = await MapObject.create({
        category,
        userId: user.id,
        point: { type: 'Point', coordinates: [longitude, latitude] },
        //flipped
      });

      const objectDetails = await MapObjectDetails.create({
        name,
        description,
        phoneStationary,
        phoneMobile,
        images: images,
        website,
        address,
        objectId: object.id,
      });

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }

    // return `created object ${id}`;
  }

  async createReview(req: any, createReviewDto: CreateReviewDto) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: Verifications }],
      });

      const { objectId, review, rating } = createReviewDto;

      const existingReview = await MapObjectReview.findOne({
        where: { userId: user.id, objectId: objectId },
      });

      if (!!existingReview) {
        throw new HttpException(
          'Вы уже оставляли отзыв на этот объект',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const newReview = await MapObjectReview.create({
        userId: user.id,
        objectId: +objectId,
        text: review,
        rating,
      });

      // console.log(!!newReview);

      // console.log(!!existingReview);
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.CONFLICT, {
        cause: new Error('Some Error'),
      });
    }
  }

  async createReply(req: any, createReplyDto: CreateReplyDto) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: Verifications }],
      });
      const { reviewId, reply } = createReplyDto;
      // console.log(reviewId, reply);

      const existingReply = await MapObjectReply.findOne({
        where: { userId: user.id, reviewId: reviewId },
      });

      if (!!existingReply) {
        throw new HttpException(
          'Вы уже оставляли ответ на этот отзыв',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      const newReply = await MapObjectReply.create({
        userId: user.id,
        reviewId: +reviewId,
        text: reply,
      });

      if (!newReply) {
        throw new HttpException('Ошибка', StatusCodes.BAD_GATEWAY, {
          cause: new Error('Some Error'),
        });
      }
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
    // return `created reply for review ${id}`;
  }
}

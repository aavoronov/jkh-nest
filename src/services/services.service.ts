import { HttpException, Injectable } from '@nestjs/common';
import { writeFile } from 'fs';
import { Base64 } from 'js-base64';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceSubcategory } from './entities/service-subcategory.entity';
import { Service } from './entities/service.entity';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { StatusCodes } from 'http-status-codes';
import { Op, Sequelize } from 'sequelize';
import { CreateReviewDto } from './dto/create-review.dto';
import { Verifications } from '../verifications/entities/verification.entity';
import { ServiceReview } from './entities/service-review';
import { Profile } from '../users/entities/profile.entity';
import { Literal } from 'sequelize/types/utils';

@Injectable()
export class ServicesService {
  private async uploadFiles(
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    try {
      // console.log(files);
      const filenames = [];

      files.forEach((item: Express.Multer.File) => {
        let dbFileName = null;
        // console.log(item.mimetype);

        const fileName = Base64.encodeURI(
          (Math.random() * 1000).toString() + Date.now(),
        );
        dbFileName =
          fileName +
          item.originalname.slice(item.originalname.lastIndexOf('.'));

        filenames.push(dbFileName);

        const buffer = item.buffer;
        // const myBuffer = Buffer.from(item);
        writeFile(`./uploads/services/${dbFileName}`, buffer, (err) => {
          !!err && console.log(err);
        });
      });
      return filenames;
    } catch (e) {
      console.log(e);
    }
  }

  async getCategories() {
    const categories = await ServiceCategory.findAll({
      include: [{ model: ServiceSubcategory }],
    });
    return categories;
  }

  async createService(
    files: {
      mainImage: Array<Express.Multer.File>;
      passport: Array<Express.Multer.File>;
      portfolio: Array<Express.Multer.File>;
    },

    createServiceDto: CreateServiceDto,
    req: any,
  ) {
    try {
      console.log(createServiceDto);
      console.log(files);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const {
        subcategory,
        longitude,
        latitude,
        address,
        name,
        isOrg,
        brigade,
        contract,
        accommodation,
        warranty,
        workDays,
        workLocation,
        workTime,
        price,
        description,
      } = createServiceDto;

      const mainImage = await this.uploadFiles(files.mainImage);
      const passport = await this.uploadFiles(files.passport);
      const portfolio = !!files.portfolio
        ? await this.uploadFiles(files.portfolio)
        : [];

      // const cat =
      // const subcat = await ServiceSubcategory.findOne({ where: { subcategory } });
      const service = await Service.create({
        subcategoryId: +subcategory,
        experience: '',
        mainImage: mainImage[0],
        portfolio,
        passport,
        address,
        name,
        point: { type: 'Point', coordinates: [longitude, latitude] },
        isOrg,
        brigade,
        contract,
        accommodation,
        warranty,
        workDays,
        workLocation,
        workTime,
        price,
        description,
        userId: user.id,
      });
      if (!service) {
        throw new HttpException('Ошибка', StatusCodes.INTERNAL_SERVER_ERROR, {
          cause: new Error('some error'),
        });
      }

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      console.log(e);
    }
  }

  async getServices(
    req: any,
    page: number,
    warranty: string | undefined,
    contract: string | undefined,
    isChecked: string | undefined,
    withPortfolio: string | undefined,
    privatePerson: string | undefined,
    organization: string | undefined,
    withAccommodation: string | undefined,
    withoutAccommodation: string | undefined,
    category: string | undefined,
    searchQuery: string | undefined,
    radius: number | undefined,
    longitude: number | undefined,
    latitude: number | undefined,

    // location: string | undefined,
  ) {
    // interface IWhereStatement {
    //   [Op.or]?:
    //     | {
    //         name: { [Op.iLike]: string };
    //         description: { [Op.iLike]: string };
    //       }
    //     | undefined;
    //   portfolio?: { [Op.ne]: null } | undefined;
    //   isChecked?: true | undefined;
    //   contract?: true | undefined;
    //   warranty?: true | undefined;
    //   accommodation?: boolean | undefined;
    //   isOrg?: boolean | undefined;
    //   subcategoryId?: number[] | undefined;
    // }
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });
      const limit = 10;
      const offset = page * limit - limit;

      const whereStatement: any = {};
      let radiusQuery: Literal | true = true;

      if (warranty !== void 0) whereStatement.warranty = true;
      if (isChecked !== void 0) whereStatement.isChecked = true;
      if (contract !== void 0) whereStatement.contract = true;
      if (withPortfolio !== void 0)
        whereStatement.portfolio = { [Op.ne]: null };
      if (privatePerson) whereStatement.isOrg = false;
      if (organization) whereStatement.isOrg = true;
      if (withAccommodation !== void 0) whereStatement.accommodation = true;
      if (withoutAccommodation !== void 0) whereStatement.accommodation = false;
      if (category) {
        const subcategories = await ServiceSubcategory.findAll({
          where: { categoryId: category },
        });
        const subcategoriesIndices: number[] = subcategories.map(
          (item) => item.id,
        );
        whereStatement.subcategoryId = subcategoriesIndices;
      }
      if (!!searchQuery) {
        whereStatement[Op.or] = {
          name: { [Op.iLike]: `%${searchQuery}%` },
          description: { [Op.iLike]: `%${searchQuery}%` },
        };
      }

      if (!!radius) {
        radiusQuery = Sequelize.literal(
          `ST_DistanceSphere(ST_MakePoint(${longitude}, ${latitude}), "point") < ${radius}`,
        );
      }

      //radius

      console.log('whereStatement', whereStatement);

      const services = await Service.findAll({
        // where: whereStatement,
        where: {
          [Op.and]: [whereStatement, radiusQuery],
        },
        attributes: [
          'id',
          'name',
          'address',
          'contract',
          'description',
          'price',
          'portfolio',
          'mainImage',
          'isChecked',
          // [
          //   Sequelize.literal(
          //     `ST_DistanceSphere(ST_MakePoint(${longitude}, ${latitude}), "point")`,
          //   ),
          //   'distance',
          // ],
        ],

        order: [['id', 'DESC']],
        limit: limit,
        offset: offset,
        include: [
          {
            model: ServiceReview,
            required: false,
            attributes: ['rating'],
            // where: { isApproved: true },
          },
          {
            model: User,
            attributes: ['phone'],
            // where: { isApproved: true },
          },
          { model: ServiceSubcategory, include: [{ model: ServiceCategory }] },
        ],
      });

      const count = await Service.count({
        where: {
          [Op.and]: [whereStatement, radiusQuery],
        },
      });

      console.log(count);

      return { count, services };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async createReview(req: any, createReviewDto: CreateReviewDto) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
        include: [{ model: Verifications }],
      });

      const { serviceId, review, rating } = createReviewDto;

      const existingReview = await ServiceReview.findOne({
        where: { userId: user.id, serviceId: serviceId },
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

      const newReview = await ServiceReview.create({
        userId: user.id,
        serviceId: +serviceId,
        text: review,
        rating,
      });

      console.log(!!newReview);

      console.log(!!existingReview);
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, StatusCodes.CONFLICT, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getById(id: number) {
    try {
      const service = await Service.findOne({
        where: { id },
        attributes: [
          'phone',
          'isChecked',
          'address',
          'experience',
          'brigade',
          'contract',
          'warranty',
          'workDays',
          'workLocation',
          'workTime',
          'price',
          'description',
          'mainImage',
          'portfolio',
          'createdAt',
          'userId',
          'subcategoryId',
          'name',
        ],
        include: [
          {
            model: ServiceSubcategory,
            attributes: ['subcategory'],
            include: [{ model: ServiceCategory, attributes: ['category'] }],
          },
          {
            model: User,
            attributes: ['phone'],
          },
        ],
      });

      return service;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getReviews(id: number, page: number) {
    try {
      const limit = 10;
      const offset = page * limit - limit;

      const reviews = await ServiceReview.findAll({
        where: { serviceId: id },
        attributes: ['id', 'text', 'createdAt', 'rating'],
        // where: { isApproved: true },
        limit,
        offset,
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
      });

      const count = await ServiceReview.findAll({
        where: { serviceId: id },
        attributes: ['rating'],
      });

      let rating = 0;
      count.forEach((item) => (rating += item.rating));

      console.log(count.length ? rating / count.length : 0);

      return {
        reviews,
        rating: count.length ? rating / count.length : 0,
        count: count.length,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getMyServices(req: any, page: number) {
    try {
      const limit = 10;

      const offset = page * limit - limit;

      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      console.log(page);

      const services = await Service.findAll({
        where: { userId: user.id },
        attributes: [
          'id',
          'name',
          'address',
          'contract',
          'description',
          'price',
          'portfolio',
          'mainImage',
          'isChecked',
          'contract',
        ],
        order: [['id', 'DESC']],
        limit: limit,
        offset: offset,
      });

      const count = await Service.count({
        where: { userId: user.id },
      });

      console.log(count);

      return { count, services };
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async deleteService(req: any, id: number) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const service = await Service.destroy({
        where: { userId: user.id, id: id },
      });

      if (!service) {
        throw new HttpException(
          'Объявление не существует или уже было удалено',
          StatusCodes.CONFLICT,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} service`;
  // }

  // update(id: number, updateServiceDto: UpdateServiceDto) {
  //   return `This action updates a #${id} service`;
  // }
}

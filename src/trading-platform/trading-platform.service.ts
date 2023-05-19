import { HttpException, Injectable } from '@nestjs/common';
import { writeFile } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Base64 } from 'js-base64';
import * as jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { TransactionTypes } from '../transactions/dto/create-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateTradingPlatformProductDto } from './dto/create-trading-platform-product.dto';
import { UpdateTradingPlatformProductDto } from './dto/update-trading-platform-product.dto';
import { TradingPlatformCategory } from './entities/trading-platform-category.entity';
import { TradingPlatformFavorites } from './entities/trading-platform-favorites.entity';
import { TradingPlatformProduct } from './entities/trading-platform-product.entity';
import { TradingPlatformSubcategory } from './entities/trading-platform-subcategory.entity';

@Injectable()
export class TradingPlatformService {
  constructor(private readonly transactionsService: TransactionsService) {}
  private async uploadFiles(
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    try {
      // // console.log(files);
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

        if (item.mimetype === 'application/octet-stream') {
          const b64string = item.buffer.toString();
          // var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");
          const base64Image = b64string.split(';base64,').pop();
          const buf = Buffer.from(b64string);
          // const buf = Buffer.from(item.buffer, 'base64');
          // console.log(buf);
          // // console.log(item.buffer.toString());
          writeFile(
            `./uploads/trading-platform/${dbFileName}`,
            base64Image,
            { encoding: 'base64' },
            (err) => {
              !!err && console.log(err);
            },
          );
        } else {
          const buffer = item.buffer;
          // const myBuffer = Buffer.from(item);
          writeFile(
            `./uploads/trading-platform/${dbFileName}`,
            buffer,
            (err) => {
              !!err && console.log(err);
            },
          );
        }
      });
      return filenames;
    } catch (e) {
      // console.log(e);
    }
  }

  async getCategories() {
    const categories = await TradingPlatformCategory.findAll({
      include: [{ model: TradingPlatformSubcategory }],
    });
    return categories;
  }

  async createProduct(
    files: Array<Express.Multer.File>,
    req: any,
    createTradingPlatformProductDto: CreateTradingPlatformProductDto,
  ) {
    try {
      const dbFilenames = await this.uploadFiles(files);
      const images = dbFilenames.length ? dbFilenames : null;
      // console.log(createTradingPlatformProductDto);
      // console.log(images);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });
      const {
        name,
        subcategory,
        condition,
        wts,
        description,
        location,
        price,
        phone,
        hasWhatsapp,
        hasTelegram,
        promoPrimary,
        isVip,
      } = createTradingPlatformProductDto;

      const re = new RegExp(/^[0-9\b]+$/);
      if (!re.test(price)) {
        throw new HttpException(
          'Указанная цена имеет неверный формат',
          StatusCodes.BAD_REQUEST,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      // // console.log(isVip);
      const paidUntil = new Date();
      paidUntil.setDate(paidUntil.getDate() + +promoPrimary);

      // console.log(paidUntil);

      const product = await TradingPlatformProduct.create({
        name,
        subcategoryId: +subcategory,
        condition: +condition,
        images: images,
        wts,
        description,
        location,
        price: +price,
        phone,
        hasWhatsapp,
        hasTelegram,
        isPaidUntil: paidUntil,
        isVip,
        userId: user.id,
      });

      let basis: TransactionTypes = TransactionTypes.default;
      let sum = 0;

      if (isVip) {
        sum += 500;
        if (+promoPrimary === 0) {
          basis = TransactionTypes.TPVip;
        }
        if (+promoPrimary === 3) {
          sum += 500;
          basis = TransactionTypes.TPTop3dVip;
        }
        if (+promoPrimary === 7) {
          sum += 1000;
          basis = TransactionTypes.TPTop7dVip;
        }
      } else {
        if (+promoPrimary === 3) {
          sum += 500;
          basis = TransactionTypes.TPTop3d;
        }
        if (+promoPrimary === 7) {
          sum += 1000;
          basis = TransactionTypes.TPTop7d;
        }
      }

      if (!!promoPrimary || isVip) {
        const transaction = await this.transactionsService.createTransaction({
          sum: sum,
          basis: basis,
          userId: user.id,
          objectId: product.id,
        });
      }

      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      // // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getProducts(
    req: any,
    page: number,
    subcategoryId: string | undefined,
    condition: string | undefined,
    pmin: string | undefined,
    pmax: string | undefined,
    wimgsonly: string | undefined,
    category: string | undefined,
    wts: string | undefined,
    searchQuery: string | undefined,
    location: string | undefined,
  ) {
    // interface whereStatement {
    //   name: string;
    //   price: string;
    //   images;
    //   description;
    //   condition;
    //   subcategoryId: number | undefined;
    //   wts;
    // }
    try {
      // console.log(condition);
      // console.log('subcategoryId', subcategoryId);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });
      const limit = 18;

      const offset = page * limit - limit;

      const whereStatement: any = {};
      if (parseInt(wimgsonly)) whereStatement.images = { [Op.ne]: null };
      if (wts !== void 0) whereStatement.wts = wts;
      if (condition) whereStatement.condition = condition.split(',');
      if (pmin) whereStatement.price = { [Op.gte]: pmin };
      if (pmax) whereStatement.price = { [Op.lte]: pmax };
      if (!!pmin && !!pmax) {
        whereStatement.price = { [Op.between]: [pmin, pmax] };
      }
      if (searchQuery) whereStatement.name = { [Op.iLike]: `%${searchQuery}%` };
      if (category) {
        const subcategories = await TradingPlatformSubcategory.findAll({
          where: { categoryId: category },
        });
        const subcategoriesIndices = subcategories.map((item) => item.id);
        whereStatement.subcategoryId = subcategoriesIndices;
      }
      if (subcategoryId) whereStatement.subcategoryId = subcategoryId;

      // console.log('whereStatement', whereStatement);

      const products = await TradingPlatformProduct.findAll({
        where: whereStatement,
        attributes: [
          'id',
          'images',
          'isVip',
          // 'isPaidUntil',
          'name',
          'price',
          'location',
          'createdAt',
          [
            Sequelize.literal(
              `CASE WHEN "isPaidUntil" > current_timestamp THEN true ELSE false END`,
            ),
            'ispaid',
          ],
        ],
        include: [
          {
            model: TradingPlatformFavorites,
            as: 'favorites',
            // attributes: ['id'],
            where: { userId: user.id },
            required: false,
          },
        ],
        order: [
          [Sequelize.literal('isPaid'), 'DESC'],
          ['id', 'DESC'],
        ],
        limit: limit,
        offset: offset,
      });

      const count = await TradingPlatformProduct.count({
        where: whereStatement,
      });

      // console.log(count);

      return { count, products };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getMyProducts(req: any, page: number) {
    try {
      const limit = 18;

      const offset = page * limit - limit;

      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      // console.log(page);

      const products = await TradingPlatformProduct.findAll({
        where: { userId: user.id },
        attributes: [
          'id',
          'images',
          'isVip',
          'isPaidUntil',
          'name',
          'price',
          'location',
          'createdAt',
          [
            Sequelize.literal(
              `CASE WHEN "isPaidUntil" > current_timestamp THEN true ELSE false END`,
            ),
            'ispaid',
          ],
        ],
        order: [
          [Sequelize.literal('isPaid'), 'DESC'],
          ['id', 'DESC'],
        ],
        limit: limit,
        offset: offset,
      });

      const count = await TradingPlatformProduct.count({
        where: { userId: user.id },
      });

      // console.log(count);

      return { count, products };
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async toggleFavorites(req: any, id: number) {
    try {
      // console.log(id);
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const fave = await TradingPlatformFavorites.findOne({
        where: { userId: user.id, productId: id },
      });

      if (!!fave) {
        await fave.destroy();
      } else {
        await TradingPlatformFavorites.create({
          userId: user.id,
          productId: id,
        });
      }
      return { status: StatusCodes.OK, text: 'success' };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async deleteProduct(req: any, id: number) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const product = await TradingPlatformProduct.destroy({
        where: { userId: user.id, id: id },
      });

      if (!product) {
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
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getMyFaves(req: any, page: number) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });
      const limit = 18;

      const offset = page * limit - limit;

      const products = await TradingPlatformProduct.findAll({
        attributes: [
          'id',
          'images',
          'isVip',
          'isPaidUntil',
          'name',
          'price',
          'location',
          'createdAt',
        ],
        include: {
          model: TradingPlatformFavorites,
          as: 'favorites',
          // attributes: ['id'],
          where: { userId: user.id },
          required: true,
        },
        order: [['id', 'DESC']],
        limit: limit,
        offset: offset,
      });

      const count = await TradingPlatformProduct.count({
        include: {
          model: TradingPlatformFavorites,
          as: 'favorites',
          // attributes: ['id'],
          where: { userId: user.id },
          required: true,
        },
      });

      // console.log(count);

      return { count, products };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getProductById(req: any, id: number) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });

      const product = await TradingPlatformProduct.findOne({
        where: { id: id },
        include: [
          {
            model: TradingPlatformFavorites,
            as: 'favorites',
            // attributes: ['id'],
            where: { userId: user.id },
            required: false,
          },
          {
            model: TradingPlatformSubcategory,
            include: [
              {
                model: TradingPlatformCategory,
              },
            ],
            // include: {
            //
            //   as: 'category',
            // },
          },
          {
            model: User,
            attributes: ['id'],
            include: [
              { model: Profile, attributes: ['pseudonym', 'createdAt'] },
            ],
          },
        ],
      });

      await product.update({ views: product.views + 1 });

      const likes = await TradingPlatformFavorites.count({
        where: { productId: id },
      });

      const resData = {
        ...product.toJSON(),
        likes: likes,
      };

      return resData;
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_REQUEST, {
        cause: new Error('Some Error'),
      });
    }
  }

  async updateProduct(
    files: Array<Express.Multer.File>,
    req: any,
    updateTradingPlatformProductDto: UpdateTradingPlatformProductDto,
    id: number,
  ) {
    const {
      name,
      subcategory,
      condition,
      wts,
      description,
      location,
      price,
      phone,
      hasWhatsapp,
      hasTelegram,
      promoPrimary,
      isVip,
    } = updateTradingPlatformProductDto;

    // console.log(files);

    const dbFilenames = await this.uploadFiles(files);
    const images = dbFilenames.length ? dbFilenames : null;
    // console.log(updateTradingPlatformProductDto);
    // console.log(images);

    const token = req.headers.authorization;
    const result = jwt.verify(token, process.env.JWT);
    const user = await User.findOne({
      where: { email: result.email },
    });

    const product = await TradingPlatformProduct.findOne({
      where: { id: id, userId: user.id },
    });

    await product.update({
      name,
      subcategoryId: +subcategory,
      condition: +condition,
      images: images,
      wts,
      description,
      location,
      price: +price,
      phone,
      hasWhatsapp,
      hasTelegram,
    });
    return { status: StatusCodes.OK, text: 'success' };
  }

  remove(id: number) {
    return `This action removes a #${id} tradingPlatformProduct`;
  }
}

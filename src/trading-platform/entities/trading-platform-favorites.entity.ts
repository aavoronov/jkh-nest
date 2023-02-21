import { User } from '../../users/entities/user.entity';
import { BelongsTo, ForeignKey, Model, Table } from 'sequelize-typescript';
import { TradingPlatformProduct } from './trading-platform-product.entity';

@Table
export class TradingPlatformFavorites extends Model<TradingPlatformFavorites> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => TradingPlatformProduct)
  product: TradingPlatformProduct;

  @ForeignKey(() => TradingPlatformProduct)
  productId: number;
}

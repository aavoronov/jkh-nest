import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { Complaint } from './entities/complaint.entity';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ComplaintsService {
  async createComplaint(req: any, createComplaintDto: CreateComplaintDto) {
    try {
      const token = req.headers.authorization;
      const result = jwt.verify(token, process.env.JWT);
      const user = await User.findOne({
        where: { email: result.email },
      });
      // console.log(createComplaintDto);
      const { type, reason, text, objectId } = createComplaintDto;
      const data = {
        objectType: type,
        reason,
        text,
        objectId,
        userId: user.id,
      };

      const complaint = await Complaint.create(data);
      return { status: 201, text: 'success' };
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_GATEWAY, {
        cause: new Error('Some Error'),
      });
    }
    // const complaint = await Complaint.create(createComplaintDto);
    // // console.log(complaint);

    return 'This action adds a new complaint';
  }

  findAll() {
    return `This action returns all complaints`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complaint`;
  }

  update(id: number, updateComplaintDto: UpdateComplaintDto) {
    return `This action updates a #${id} complaint`;
  }

  remove(id: number) {
    return `This action removes a #${id} complaint`;
  }
}

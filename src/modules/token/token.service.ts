import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Models } from 'src/common';
import { TokenDocument } from 'src/models';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Models.TOKEN) private tokenModel: Model<TokenDocument>,
  ) {}

  generateToken(payload: Record<string, any>): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  async saveToken(userId: string, refreshToken): Promise<TokenDocument> {
    const neededToken = await this.tokenModel.findOne({ userId });

    if (neededToken) {
      neededToken.refreshToken = refreshToken;

      return neededToken.save();
    }

    const newToken = await this.tokenModel.create({ userId, refreshToken });

    return await newToken.save();
  }
}

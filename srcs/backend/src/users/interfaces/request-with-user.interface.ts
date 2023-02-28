import { Request } from 'express';
import { User } from '../entities/user.entity';

export interface RequestWithUser extends Request {
    user: User;
}

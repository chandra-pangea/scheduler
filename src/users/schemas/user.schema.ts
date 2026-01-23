import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ default: true })
    isActive: boolean;

    // Virtual field for jobs relationship
    jobs: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual for jobs
UserSchema.virtual('jobs', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'userId',
});

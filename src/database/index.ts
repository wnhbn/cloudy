import { Message } from './entity/message.entity';
import { Conversation } from './entity/conversation.entity';
import { User } from './entity/user.entity';
import { Friendship } from './entity/friendship.entity';
import { Socket } from './entity/socket.entity';
const entities: any[] = [User, Friendship, Conversation, Message, Socket];

export default entities;

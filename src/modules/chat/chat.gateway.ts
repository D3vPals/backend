import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Namespace, Socket, Server } from 'socket.io';

export const onlineMap = {};

// 사용자들이 생성하기 때문에 정규식으로 작성
// implments 뒤에 있는 것들을 작성하면 무조건 해야 되는 것들 => 작성 안 하면 에러남 => 필수 기능을 안 놓칠 수 있음
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() public server: Server;
  /* 아래 코드는 ChatGateway 라는 웹소켓 게이트웨이 클래스에서 웹소켓 서버 인스턴스인 server를 public 속성값으로 갖고,
    'test'라는 이벤트로 들어오는 string의 메시지를 처리하는 handleMessage라는 메서드를 통해 클라이언트에서 들어오는 
    data를 emit 할 것을 주문하는 코드이다.*/

  @SubscribeMessage('test')
  // handleMessage(client, data): void {} // client 직접적으로 사용하고 싶거나 decorator 사용 안 원하면 이렇게도 가능
  handleTest(@MessageBody() data: string) {
    console.log('test', data);
  }

  afterInit(server: Server) {
    console.log('Websocket server init');
  }

  //   연결 되었을 때
  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log('connect', socket.nsp.name);
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    socket.emit('hello', socket.nsp.name);
  }

  //   연결 끊었을 때
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected', socket.nsp.name);
    const newNamespace = socket.nsp;
    // onlineMap = 워크스페이스 참가자 목록을 실시간으로 담고 있는 객체
    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
  }
}

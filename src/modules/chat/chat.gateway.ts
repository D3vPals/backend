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
import { Socket, Server } from 'socket.io';

export const onlineMap = {};

// 사용자들이 생성하기 때문에 정규식으로 작성
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public server: Server;

  /* 아래 코드는 ChatGateway 라는 웹소켓 게이트웨이 클래스에서 웹소켓 서버 인스턴스인 server를 public 속성값으로 갖고,
    'test'라는 이벤트로 들어오는 string의 메시지를 처리하는 handleMessage라는 메서드를 통해 클라이언트에서 들어오는 
    data를 emit 할 것을 주문하는 코드이다.*/

  @SubscribeMessage('test')
  handleTest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { message: string },
  ) {
    console.log(`📩 메시지 수신 from ${client.id}:`, data.message);

    // 보낸 사람을 포함해 모든 클라이언트에게 메시지 전송
    this.server.emit('receiveMessage', {
      message: data.message,
      sender: client.id,
    });
  }

  afterInit(server: Server) {
    console.log('✅ WebSocket 서버 초기화 완료');
  }

  //   연결 되었을 때
  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(`🔗 [${socket.id}] 연결됨 (네임스페이스: ${socket.nsp.name})`);

    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }

    onlineMap[socket.nsp.name][socket.id] = socket.id;

    // 현재 접속한 모든 클라이언트에게 온라인 유저 목록 전송
    this.server.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));

    socket.emit('hello', socket.nsp.name);
  }

  //   연결 끊었을 때
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(
      `❌ [${socket.id}] 연결 해제 (네임스페이스: ${socket.nsp.name})`,
    );

    if (onlineMap[socket.nsp.name]) {
      delete onlineMap[socket.nsp.name][socket.id];

      // 연결 해제된 클라이언트 제외하고 온라인 유저 목록 업데이트
      this.server.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
    }
  }
}

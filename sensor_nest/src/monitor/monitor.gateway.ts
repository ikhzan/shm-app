import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MonitorService } from './monitor.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@WebSocketGateway()
export class MonitorGateway {
  constructor(private readonly monitorService: MonitorService) {}

  @SubscribeMessage('createMonitor')
  create(@MessageBody() createMonitorDto: CreateMonitorDto) {
    return this.monitorService.create(createMonitorDto);
  }

  @SubscribeMessage('findAllMonitor')
  findAll() {
    return this.monitorService.findAll();
  }

  @SubscribeMessage('findOneMonitor')
  findOne(@MessageBody() id: number) {
    return this.monitorService.findOne(id);
  }

  @SubscribeMessage('updateMonitor')
  update(@MessageBody() updateMonitorDto: UpdateMonitorDto) {
    return this.monitorService.update(updateMonitorDto.id, updateMonitorDto);
  }

  @SubscribeMessage('removeMonitor')
  remove(@MessageBody() id: number) {
    return this.monitorService.remove(id);
  }
}

import {
  Socket as TCPSocket,
  SocketAddress,
  createConnection as createTcpConnection,
} from 'net';
import { Socket as UDPSocket, createSocket as createUdpSocket } from 'dgram';
import PacketStream from './PacketStream';
import DeviceInfoState from '../../common/DeviceInfoState';
import * as protos from '../../../protos-main/protos';

const DEFAULT_RUNTIME_PORT = 8101;
const UDP_PORT = 9001;
const TCP_RECONNECT_DELAY = 2000;
const PING_INTERVAL = 5000;

/**
 * A type of packet.
 */
enum MsgType {
  RUN_MODE = 0,
  START_POS = 1,
  LOG = 2,
  DEVICE_DATA = 3,
  // 4 reserved for some Shepherd msg type
  INPUTS = 5,
  TIME_STAMPS = 6,
}

/**
 * Describes a Runtime packet.
 */
interface Packet {
  /**
   * The type of packet. Might not be a valid MsgType.
   */
  type: number;
  /**
   * The packet payload.
   */
  data: Buffer;
}

/**
 * Handler interface for data received from the robot and transmission errors.
 */
export interface RuntimeCommsListener {
  /**
   * Called when the robot emits log messages.
   * @param msgs - an array of new log messages.
   */
  onReceiveRobotLogs: (msgs: string[]) => void;
  /**
   * Called when a latency check completes.
   * @param latency - the measured robot connection latency.
   */
  onReceiveLatency: (latency: number) => void;
  /**
   * Called when the robot sends lowcar device state.
   * @param deviceInfoState - an array of the devices currently connected to the robot and their
   * currently measured parameters.
   */
  onReceiveDevices: (deviceInfoState: DeviceInfoState[]) => void;
  /**
   * Called when an error is encountered in the TCP connection to the robot.
   * @param err - the error.
   */
  onRuntimeTcpError: (err: Error) => void;
  /**
   * Called when the UDP socket encounters an error or data received by the UDP socket is malformed.
   * @param err - the error. Protobuf ProtocolErrors are likely the result of a UDP transmission
   * error.
   */
  onRuntimeUdpError: (err: Error) => void;
  /**
   * Called when a generic Runtime communications error is encountered.
   * @param err - the error.
   */
  onRuntimeError: (err: Error) => void;
  /**
   * Called when the TCP connection to the robot is lost for any reason.
   */
  onRuntimeDisconnect: () => void;
}

/**
 * Responsible for all communications with Runtime.
 */
export default class RuntimeComms {
  /**
   * Handler for robot data and transmission errors.
   */
  readonly #commsListener: RuntimeCommsListener;

  /**
   * IP address of robot running Runtime to connect to.
   */
  #runtimeAddr: string;

  /**
   * Port Runtime is listening on on the connected robot.
   */
  #runtimePort: number;

  /**
   * The TCP connection used to send and receive transmission-guarenteed data from Runtime.
   */
  #tcpSock: TCPSocket | null;

  /**
   * The UDP socket listening for realtime data from Runtime.
   */
  #udpSock: UDPSocket | null;

  /**
   * Whether communications are paused and reconnection should not be attempted automatically.
   */
  #tcpDisconnected: boolean;

  /**
   * The JavaScript interval id for the periodic ping.
   */
  #pingInterval: NodeJS.Timeout | null;

  constructor(commsListener: RuntimeCommsListener) {
    this.#commsListener = commsListener;
    this.#runtimeAddr = '';
    this.#runtimePort = 0;
    this.#tcpSock = null;
    this.#udpSock = null;
    this.#tcpDisconnected = false;
    this.#pingInterval = null;
  }

  /**
   * Stops listening to the TCP and UDP sockets until resumed by setRobotIp.
   */
  disconnect() {
    this.#tcpDisconnected = true; // Don't reconnect
    if (this.#pingInterval) {
      clearInterval(this.#pingInterval);
    }
    this.#disconnectTcp();
    this.#disconnectUdp();
  }

  /**
   * Sets the host and address of the Runtime instance to connect to.
   * @param ip - the address and optionally the port Runtime is listening on, separated by a colon.
   * @returns Whether the given IP forms a valid address.
   */
  setRobotIp(ip: string) {
    [this.#runtimeAddr] = ip.split(':');
    const portStr: string | undefined = ip.split(':')[1];
    this.#runtimePort = portStr ? Number(portStr) : DEFAULT_RUNTIME_PORT;
    try {
      // eslint-disable-next-line no-new
      new SocketAddress({
        address: this.#runtimeAddr,
        port: this.#runtimePort,
      });
    } catch {
      return false;
    }
    this.#connectTcp(); // Reconnect TCP, UDP will just start sending to new host
    return true;
  }

  /**
   * Sends a new run mode.
   * @param mode - the new run mode.
   */
  sendRunMode(mode: protos.Mode) {
    if (this.#tcpSock) {
      this.#tcpSock.write(this.#createPacket(MsgType.RUN_MODE, { mode }));
    }
  }

  /**
   * Sends device preferences.
   * @param deviceData - device preferences to send.
   */
  sendDevicePreferences(deviceData: protos.IDevData) {
    if (this.#tcpSock) {
      this.#tcpSock.write(this.#createPacket(MsgType.DEVICE_DATA, deviceData));
    }
  }

  /**
   * Sends challenge data.
   * @param data - the textual challenge data to send.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendChallengeInputs(data: protos.IText) {
    if (this.#tcpSock) {
      throw new Error('Not implemented.'); // MsgTypes from old dawn are inconsistent?
      // this.#tcpSock.write(this.#createPacket(MsgType.CHALLENGE_DATA, data));
    }
  }

  /**
   * Sends the robot's starting position.
   * @param startPos - the robot's starting position index to send.
   */
  sendRobotStartPos(startPos: protos.IStartPos) {
    if (this.#tcpSock) {
      this.#tcpSock.write(this.#createPacket(MsgType.START_POS, startPos));
    }
  }

  /**
   * Sends control inputs to the robot.
   * @param inputs - the inputs to send.
   */
  sendInputs(inputs: protos.Input[]) {
    // if (this.#udpSock) {
    //  this.udpSock.send(protos.UserInputs.encode({
    //    inputs: inputs.length ? inputs : [
    //      protos.Input.create({ connected: false, source })
    //    ],
    //  }), this.#runtimePort, this.#runtimeAddr);
    // }
    // Old Dawn sends inputs through TCP, though comments say this is just for 2021?
    if (this.#tcpSock) {
      this.#tcpSock.write(this.#createPacket(MsgType.INPUTS, { inputs }));
    }
  }

  /**
   * Sends a timestamped packet that Runtime will echo, updating the latency when we receive it
   * again.
   */
  #sendLatencyTest() {
    if (this.#tcpSock) {
      this.#tcpSock.write(
        this.#createPacket(
          MsgType.TIME_STAMPS,
          new protos.TimeStamps({
            dawnTimestamp: Date.now(),
            runtimeTimestamp: 0,
          }),
        ),
      );
    }
  }

  /**
   * Disconnects the old TCP socket if open, then makes a new one and connects it to the
   * most recently known Runtime IP and port.
   */
  #connectTcp() {
    this.#tcpDisconnected = false;
    this.#disconnectTcp();
    const tcpStream = new PacketStream().on(
      'data',
      this.#handlePacket.bind(this),
    );
    this.#tcpSock = createTcpConnection(this.#runtimePort, this.#runtimeAddr)
      .on('connect', this.#handleTcpConnection.bind(this))
      .on('close', this.#handleTcpClose.bind(this))
      .on(
        'error',
        this.#commsListener.onRuntimeTcpError.bind(this.#commsListener),
      );
    this.#tcpSock.pipe(tcpStream);
    this.#pingInterval = setInterval(
      this.#sendLatencyTest.bind(this),
      PING_INTERVAL,
    );
  }

  /**
   * Closes the old UDP socket if open, then makes and binds a new one.
   */
  #connectUdp() {
    this.#disconnectUdp();
    this.#udpSock = createUdpSocket({
      type: 'udp4',
      reuseAddr: true,
    })
      .on(
        'error',
        this.#commsListener.onRuntimeUdpError.bind(this.#commsListener),
      )
      .on('message', this.#handleUdpMessage.bind(this))
      .bind(UDP_PORT);
  }

  /**
   * Ends and disconnects the TCP socket if open.
   */
  #disconnectTcp() {
    if (this.#tcpSock) {
      this.#tcpSock.resetAndDestroy();
      this.#tcpSock = null;
    }
  }

  /**
   * Closes the UDP socket if open.
   */
  #disconnectUdp() {
    if (this.#udpSock) {
      this.#udpSock.close();
      this.#udpSock = null;
    }
  }

  /**
   * Handler for TCP 'connect' event.
   */
  #handleTcpConnection() {
    if (this.#tcpSock) {
      this.#tcpSock.write(new Uint8Array([1])); // Tell Runtime that we are Dawn, not Shepherd
    }
  }

  /**
   * Processes a received packet.
   * @param packet - the received packet.
   */
  #handlePacket(packet: Packet) {
    const { type, data } = packet;
    switch (type) {
      case MsgType.LOG:
        // this.#commsListener.onReceiveRobotLogs(
        //  protos.Text.decode(data).payload,
        // );
        break;
      case MsgType.TIME_STAMPS:
        this.#commsListener.onReceiveLatency(
          (Date.now() - Number(protos.TimeStamps.decode(data))) / 2,
        );
        break;
      // case MsgType.CHALLENGE_DATA:
      // TODO: ??? Not implemented in old Dawn
      // break;
      case MsgType.DEVICE_DATA:
        // Convert decoded Devices to DeviceInfoStates before passing to onReceiveDevices
        this.#commsListener.onReceiveDevices(
          protos.DevData.decode(data).devices.map(
            (
              deviceProps: protos.IDevice,
              _devIdx: number,
              _devArr: protos.IDevice[],
            ) => {
              const device = new protos.Device(deviceProps);
              return {
                id: `${device.type.toString()}_${device.uid.toString()}`,
                ...Object.fromEntries(
                  device.params.map(
                    (
                      paramProps: protos.IParam,
                      _paramIdx: number,
                      _paramArr: protos.IParam[],
                    ) => {
                      const param = new protos.Param(paramProps);
                      return param.val
                        ? [param.name, param[param.val].toString()]
                        : [];
                    },
                  ),
                ),
              };
            },
          ),
        );
        break;
      default:
        this.#commsListener.onRuntimeError(
          new Error(
            `Received unexpected packet MsgType ${type}.\nPacket: ${JSON.stringify(
              packet,
            )}`,
          ),
        );
    }
  }

  /**
   * Processes a Buffer assumed to be the payload of a device data packet with some error checking
   * code because UDP packets might not be well-formed.
   * @param data - the payload of the received packet.
   */
  #handleUdpMessage(data: Buffer) {
    try {
      this.#handlePacket({ type: MsgType.DEVICE_DATA, data });
    } catch (err) {
      this.#commsListener.onRuntimeUdpError(err as Error);
    }
  }

  /**
   * Handles TCP 'close' event and tries to reconnect if we didn't cause the disconnection.
   */
  #handleTcpClose() {
    this.#commsListener.onRuntimeDisconnect();
    if (!this.#tcpDisconnected) {
      setTimeout(this.#connectTcp.bind(this), TCP_RECONNECT_DELAY);
    }
  }

  /**
   * Encodes a device state packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  #createPacket(type: MsgType.DEVICE_DATA, data: protos.IDevData): Buffer;

  /**
   * Encodes a run mode packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  #createPacket(type: MsgType.RUN_MODE, data: protos.IRunMode): Buffer;

  /**
   * Encodes a robot start position packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  #createPacket(type: MsgType.START_POS, data: protos.IStartPos): Buffer;

  /**
   * Encodes a ping packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  #createPacket(type: MsgType.TIME_STAMPS, data: protos.ITimeStamps): Buffer;

  /*
   * Encodes a challenge data packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  // #createPacket(type: MsgType.CHALLENGE_DATA, data: protos.IText): Buffer;

  /**
   * Encodes an input state packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  #createPacket(type: MsgType.INPUTS, data: protos.IUserInputs): Buffer;

  /**
   * Encodes a packet.
   * @param type - the packet type.
   * @param data - the packet payload.
   * @returns The packet encoded in a Buffer
   */
  #createPacket(type: MsgType, data: unknown): Buffer {
    let packetData: Uint8Array;
    switch (type) {
      case MsgType.DEVICE_DATA:
        packetData = protos.DevData.encode(data as protos.IDevData).finish();
        break;
      case MsgType.RUN_MODE:
        packetData = protos.RunMode.encode(data as protos.IRunMode).finish();
        break;
      case MsgType.START_POS:
        packetData = protos.StartPos.encode(data as protos.IStartPos).finish();
        break;
      case MsgType.TIME_STAMPS:
        packetData = protos.TimeStamps.encode(
          data as protos.ITimeStamps,
        ).finish();
        break;
      // case MsgType.CHALLENGE_DATA:
      // packetData = protos.Text.encode(data as protos.IText).finish();
      // break;
      case MsgType.INPUTS:
        // Source says input data isn't usually sent through TCP? What's that about?
        packetData = protos.UserInputs.encode(
          data as protos.IUserInputs,
        ).finish();
        break;
      default:
        this.#commsListener.onRuntimeError(
          new Error(`Cannot create packet with type ${type}.`),
        );
        packetData = Buffer.alloc(0);
        break;
    }

    const packet = Buffer.allocUnsafe(3 + packetData.byteLength);
    packet.writeUInt8(type, 0);
    packet.writeUInt16LE(packetData.byteLength, 1);
    Buffer.from(
      packetData.buffer,
      packetData.byteOffset,
      packetData.byteLength,
    ).copy(packet, 3);

    return packet;
  }
}

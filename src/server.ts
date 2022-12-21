import 'dotenv/config';
import 'reflect-metadata';
import express, { Application } from "express";
import socketIO, { Server as SocketIOServer,  } from "socket.io";
import { createServer, Server as HTTPServer } from "http";

import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import './utils/response/customSuccess';
import './utils/ormconfig';
import routes from './routes';
import { errorHandler } from './utils/errorHandler';

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;

  private activeSockets: string[] = [];

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = socketIO(this.httpServer);
    this.app.use(
      cors({
        origin: '*',
        methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
        credentials: true,
      }),
    );
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Allow', 'GET,PUT,POST,DELETE,PATCH,UPDATE');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,UPDATE');
      res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization, Cache-Control',
      );
      next();
    });
    
    this.app.use(morgan('combined'));
    this.app.get('/', (req, res) => {
      res.send({
        code: 200,
        message: 'Server running....',
      });
    });
    this.app.use('/', routes);
    this.app.use('*', (req, res) => {
      res.status(404).send({
        message: `Requested path not found`,
      });
    });
    
    this.app.use(errorHandler);
    
   
    this.handleSocketConnection();
  }

  private handleSocketConnection(): void {
    this.io.on("connection", socket => {
      const existingSocket = this.activeSockets.find(
        existingSocket => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            existingSocket => existingSocket !== socket.id
          )
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id]
        });
      }

      socket.on("call-user", (data: any) => {
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id
        });
      });

      socket.on("make-answer", data => {
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer
        });
      });

      socket.on("reject-call", data => {
        socket.to(data.from).emit("call-rejected", {
          socket: socket.id
        });
      });

      socket.on("disconnect", () => {
        this.activeSockets = this.activeSockets.filter(
          existingSocket => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id
        });
      });
    });
  }
  
  public listen(): void {
    this.httpServer.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  }
}

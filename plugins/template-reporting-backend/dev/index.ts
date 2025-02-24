import { loggerToWinstonLogger } from "@backstage/backend-common";
import { startStandaloneServer } from "../src/service/standaloneServer";
import { Logger } from "winston";

startStandaloneServer({port: 7007, logger: loggerToWinstonLogger(new Logger), enableCors: true})
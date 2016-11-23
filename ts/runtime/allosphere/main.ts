let allofwutils = require("allofwutils");
import * as AppModule from "./app";

let role: string = undefined;

if(process.argv[2] == "simulator") role = "simulator";
if(process.argv[2] == "renderer") role = "renderer";

allofwutils.RunAllofwApp({
    config: "allofw.yaml",
    module: AppModule,
    role: role
});

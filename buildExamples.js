let fs = require("fs");
let path = require("path");

let examplesPrefix = "ts/examples";
let examples = [
    "barChart.js",
    "sin2D.js",
    "sin3D.js",
    "sanddance.js",
    "squares.js",
    "parallelCoordinates.js",
    "parallelCoordinates2.js",
    "facebookGraph.js",
    "facebookGraphD3.js",
    "spl.js"
];

let reMetadata = /^[ \t]*\/\/\/[ \t]*([a-zA-Z0-9]+)[ \t]*\:[ \t]*(.*)$/gm;

let allExamples = [];

for(let ex of examples) {
    let code = fs.readFileSync(path.join(examplesPrefix, ex), "utf-8");
    let a;
    let metadata = {
        name: "unknown",
        viewType: "2D",
        dataFile: "",
        jsCode: code.replace(/[ \t]*\/\/\/.*/g, "").replace(/^[ \t\n]*/, "").replace(/[ \t\n]*$/, "\n"),
        background: [ 1, 1, 1, 1 ]
    }
    while((a = reMetadata.exec(code)) != null) {
        let name = a[1];
        let data = a[2];
        if(name == "name") metadata.name = data;
        if(name == "type") metadata.viewType = data;
        if(name == "data") metadata.dataFile = data;
        if(name == "background") metadata.background = JSON.parse(data);
    }
    allExamples.push(metadata);
}

let examplesDotTS = `
    export interface ExampleInfo {
        name: string;
        viewType: "2D" | "3D",
        dataFile: string;
        jsCode: string;
        background: number[];
    }

    export let examples: ExampleInfo[] = ${JSON.stringify(allExamples, null, 2)};
`;

fs.writeFileSync("ts/examples.ts", examplesDotTS, "utf-8")
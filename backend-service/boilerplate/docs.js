const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

const args = process.argv;
const pIndex = args.indexOf("-p");
let projectName = "Project name";
if (pIndex !== -1 && args[pIndex + 1]) {
  projectName = args[pIndex + 1];
}

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: projectName,
      version: "1.0.0",
    },
  },
  apis: ["./dist/**/*.js"],
};

const openapiSpecification = swaggerJsdoc(options);

fs.writeFileSync(
  "./dist/swagger-json.json",
  JSON.stringify(openapiSpecification)
);

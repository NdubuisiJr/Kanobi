const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hello World",
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

import os = require("os");
import path = require("path");
import fs = require("fs");
const fsp = fs.promises;
import stream = require("stream");
import util = require("util");
import unzipper = require("unzipper");
// disable typing due to issue with lib
// see https://github.com/sindresorhus/got/issues/1682
const got = require("got");
import { slugify } from "./slugify";

const SERVER_URL = "https://nubesgen.com";

export type HostingType = "APP_SERVICE" | "FUNCTION";
export type DatabaseType = "NONE" | "SQL_SERVER" | "POSTGRESQL" | "MYSQL";

export const GENERATOR_OPTIONS = {
  regions: [
    { id: "eastus", label: "USA - East (Virginia)" },
    { id: "westus", label: "USA - West (California)" },
    {
      id: "brazilsouth",
      label: "South America - Brazil South (São Paulo State)",
    },
    { id: "francecentral", label: "Europe - France Central (Paris)" },
    { id: "westeurope", label: "Europe - West Europe (Netherlands)" },
    { id: "australiaeast", label: "Asia Pacific - Australia East (Sydney)" },
    {
      id: "australiasoutheast",
      label: "Asia Pacific - Australia Southeast (Melbourne)",
    },
  ],
  runtimes: {
    APP_SERVICE: [
      { id: "DOCKER", label: "Docker with a Dockerfile" },
      { id: "DOCKER_SPRING", label: "Docker with Spring Boot" },
      { id: "JAVA", label: "Java with Maven" },
      { id: "JAVA_GRADLE", label: "Java with Gradle" },
      { id: "SPRING", label: "Spring Boot (Java) with Maven" },
      { id: "SPRING_GRADLE", label: "Spring Boot (Java) with Gradle" },
      { id: "DOTNET", label: ".NET" },
      { id: "NODEJS", label: "Node.js (JavaScript)" },
    ],
    FUNCTION: [
      { id: "JAVA", label: "Java with Maven" },
      { id: "JAVA_GRADLE", label: "Java with Gradle" },
      { id: "SPRING", label: "Spring Boot (Java) with Maven" },
      { id: "SPRING_GRADLE", label: "Spring Boot (Java) with Gradle" },
      { id: "DOTNET", label: ".NET" },
      { id: "NODEJS", label: "Node.js (JavaScript)" },
    ],
  },
  hostingTypes: [
    {
      id: "APP_SERVICE" as HostingType,
      label: "Web Application (Azure App Service)",
    },
    {
      id: "FUNCTION" as HostingType,
      label: "Serverless Applications (Azure Functions)",
    },
  ],
  hostingSizes: {
    APP_SERVICE: [
      {
        id: "free",
        label: "Free - For development and hobbyist projects",
        detail: "Shared compute, Free SSL",
      },
      {
        id: "basic",
        label: "Basic - For dedicated dev/test",
        detail: "Dedicated compute, Free SSL, Custom domain",
      },
      {
        id: "standard",
        label: "Standard - For production workloads",
        detail: "Dedicated compute, Free SSL, Custom domain, Auto scale",
      },
    ],
    FUNCTION: [
      {
        id: "consumption",
        label: "Consumption: Scale automatically and per-second billing",
        detail:
          "First 1 million requests per month free, Auto scale, Custom domain, Free SSL",
      },
      {
        id: "premium",
        label:
          "Premium: For most businesses that want to optimize the web series",
        detail: "No cold start, Auto scale, Custom domain, Free SSL",
      },
    ],
  },
  databases: [
    { id: "NONE" as DatabaseType, label: "No database" },
    {
      id: "SQL_SERVER" as DatabaseType,
      label: "Azure SQL",
      detail: "Managed SQL database with AI",
    },
    {
      id: "POSTGRESQL" as DatabaseType,
      label: "PostgreSQL",
      detail: "Scalable open-source SQL database",
    },
    {
      id: "MYSQL" as DatabaseType,
      label: "Azure SQL",
      detail: "The SQL database you already know",
    },
  ],
  databaseSizes: {
    NONE: [],
    SQL_SERVER: [
      {
        id: "serverless",
        label: "Serverless - For development and small applications",
        detail: "5GB included (up to 4TB), Auto-shutdown/restart",
      },
      {
        id: "general_purpose",
        label: "General Purpose - For most workloads",
        detail: "5GB included (up to 4TB), 2 vCore/10GB RAM, 99.99% SLA",
      },
    ],
    POSTGRESQL: [
      {
        id: "basic",
        label: "Basic - For light workloads",
        detail: "Up to 1TB, 1 vCore/2GB RAM, 99.99% SLA, PITR backups",
      },
      {
        id: "general_purpose",
        label: "General Purpose - For most business workloads",
        detail:
          "Up to 16TB, 2 vCore/10GB RAM (+ scaling), 99.99% SLA, PITR backups",
      },
    ],
    MYSQL: [
      {
        id: "basic",
        label: "Basic - For light workloads",
        detail: "Up to 1TB, 1 vCore/2GB RAM, 99.99% SLA, PITR backups",
      },
      {
        id: "general_purpose",
        label: "General Purpose - For most business workloads",
        detail:
          "Up to 16TB, 2 vCore/10GB RAM (+ scaling), 99.99% SLA, PITR backups",
      },
    ],
  },
  addons: [
    {
      id: "storage_blob",
      label: "Blob Storage - Scalable file storage",
    },
    {
      id: "redis",
      label: "Redis - In-memory Key-Value store",
    },
    {
      id: "cosmosdb_mongodb",
      label: "MongoDB - NoSQL database powered by CosmosDB",
    },
  ],
};

export class NubesGenProject {
  name = "";
  region = "eastus";
  runtime = "DOCKER";
  gitops = false;
  components = {
    hosting: { type: "APP_SERVICE" as HostingType, size: "free" },
    database: { type: "NONE" as DatabaseType, size: "free" },
  };
  addons: string[] = [];

  get slug(): string {
    return slugify(this.name).trim();
  }

  generateUrl(): string {
    if (this.slug === "") {
      throw new Error("Invalid project name");
    }

    let url = `?region=${this.region}&application=${this.components.hosting.type}.${this.components.hosting.size}&runtime=${this.runtime}&database=${this.components.database.type}.${this.components.database.size}`;

    if (this.addons.length > 0) {
      url += `&addons=${this.addons.join(",")}`;
    }
    if (this.gitops === true) {
      url += "&gitops=true";
    }

    console.log(url);
    return url;
  }

  generateScript(type: "curl" | "posh" = "curl") {
    let url = this.generateUrl();
    const curl = `curl "${SERVER_URL}/${this.slug}.tgz${url}" | tar -xzvf -`;
    const posh = `Invoke-WebRequest -Uri "${SERVER_URL}/${this.slug}.zip${url}" -OutFile ${this.slug}.zip; Expand-Archive ${this.slug}.zip -DestinationPath '.' -Force; Remove-Item ${this.slug}.zip`;
    return type === "posh" ? posh : curl;
  }

  async generateFiles(outputDir: string) {
    let url = `${SERVER_URL}/${this.slug}.zip${this.generateUrl()}`;
    const tmpdir = await fsp.mkdtemp(path.join(os.tmpdir(), "nubesgen-"));
    const zipFile = path.join(tmpdir, "project.zip");

    // DL to temp folder
    const pipeline = util.promisify(stream.pipeline);
    await pipeline(got.stream(url), fs.createWriteStream(zipFile));

    // Unzip
    fs.createReadStream(zipFile).pipe(unzipper.Extract({ path: outputDir }));
  }
}

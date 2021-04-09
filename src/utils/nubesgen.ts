import { slugify } from "./slugify";

const SERVER_URL = "https://nubesgen.com";

const OPTIONS = {
  regions: [
    { id: "eastus", name: "USA - East (Virginia)" },
    { id: "westus", name: "USA - West (California)" },
    {
      id: "brazilsouth",
      name: "South America - Brazil South (São Paulo State)",
    },
    { id: "francecentral", name: "Europe - France Central (Paris)" },
    { id: "westeurope", name: "Europe - West Europe (Netherlands)" },
    { id: "australiaeast", name: "Asia Pacific - Australia East (Sydney)" },
    {
      id: "australiasoutheast",
      name: "Asia Pacific - Australia Southeast (Melbourne)",
    },
  ],
  appServiceRuntimes: [
    { id: "DOCKER", name: "Docker with a Dockerfile" },
    { id: "DOCKER_SPRING", name: "Docker with Spring Boot" },
    { id: "JAVA", name: "Java with Maven" },
    { id: "JAVA_GRADLE", name: "Java with Gradle" },
    { id: "SPRING", name: "Spring Boot (Java) with Maven" },
    { id: "SPRING_GRADLE", name: "Spring Boot (Java) with Gradle" },
    { id: "DOTNET", name: ".NET" },
    { id: "NODEJS", name: "Node.js (JavaScript)" },
  ],
  functionsRuntimes: [
    { id: "JAVA", name: "Java with Maven" },
    { id: "JAVA_GRADLE", name: "Java with Gradle" },
    { id: "SPRING", name: "Spring Boot (Java) with Maven" },
    { id: "SPRING_GRADLE", name: "Spring Boot (Java) with Gradle" },
    { id: "DOTNET", name: ".NET" },
    { id: "NODEJS", name: "Node.js (JavaScript)" },
  ],
};

export class NubesGenProject {
  name = '';
  region = "eastus";
  runtime = "DOCKER";
  gitops = false;
  components = {
    frontApp: { type: "APP_SERVICE", size: "free" },
    database: { type: "NONE", size: "free" },
  };
  addons = [];

  get slug(): string {
    return slugify(this.name).trim();
  }

  updateAppType(appType: string) {
    this.components.frontApp.type = appType;
    if (appType === "APP_SERVICE") {
      this.components.frontApp.size = "free";
    } else {
      this.components.frontApp.size = "consumption";
    }
  }

  generateUrl(): string {
    if (this.slug === "") {
      throw new Error('Invalid project name');
    }

    var url = `?region=${this.region}&application=${this.components.frontApp.type}.${this.components.frontApp.size}&runtime=${this.runtime}&database=${this.components.database.type}.${this.components.database.size}`;

    if (this.addons.length > 0) {
      url += `&addons=${this.addons.join(",")}`;
    }
    if (this.gitops === true) {
      url += "&gitops=true";
    }

    console.log(url);
    return url;
  }

  generateScript(type: 'curl'|'posh' = 'curl') {
    var url = this.generateUrl();
    const curl = `curl "${SERVER_URL}/${this.slug}.tgz${url}" | tar -xzvf -`;
    const posh = `Invoke-WebRequest -Uri "${SERVER_URL}/${this.slug}.zip${url}" -OutFile ${this.slug}.zip; Expand-Archive ${this.slug}.zip -DestinationPath '.' -Force; Remove-Item ${this.slug}.zip`;
    return type === 'posh' ? posh : curl;
  }

  downloadZip() {
    var url = `${this.slug}.zip${this.generateUrl()}`;
  }
}


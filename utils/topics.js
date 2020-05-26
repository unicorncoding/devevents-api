const topics = {
  softskills: {
    name: "Soft skills",
  },
  ddd: {
    name: "DDD",
  },
  microsoft: {
    name: "Microsoft",
  },
  clojure: {
    name: "Clojure",
  },
  cpp: {
    name: "C and C++",
  },
  mobile: {
    name: "Mobile",
  },
  iot: {
    name: "IoT",
  },
  web: {
    name: "Web and front-end",
  },
  data: {
    name: "Data science",
  },
  database: {
    name: "Database",
  },
  devops: {
    name: "DevOps",
  },
  dotnet: {
    name: ".NET",
  },
  elixir: {
    name: "Elixir",
  },
  react: {
    name: "React",
  },
  erlang: {
    name: "Erlang",
  },
  fullstack: {
    name: "Full-stack",
  },
  golang: {
    name: "Golang",
  },
  java: {
    name: "Java",
  },
  kotlin: {
    name: "Kotlin",
  },
  scala: {
    name: "Scala",
  },
  javascript: {
    name: "JavaScript",
  },
  leadership: {
    name: "Leadership",
  },
  management: {
    name: "Management",
  },
  architecture: {
    name: "Software architecture",
  },
  agile: {
    name: "Agile",
  },
  php: {
    name: "PHP",
  },
  product: {
    name: "Product development",
  },
  python: {
    name: "Python",
  },
  ruby: {
    name: "Ruby and Rails",
  },
  security: {
    name: "Security",
  },
  ux: {
    name: "UX",
  },
  qa: {
    name: "Testing and QA",
  },
  blockchain: {
    name: "Blockchain",
  },
  serverless: {
    name: "Serverless",
  },
  cloud: {
    name: "Cloud",
  },
  containers: {
    name: "Containers",
  },
  docker: {
    name: "Docker",
  },
  google: {
    name: "Google",
  },
  aws: {
    name: "AWS",
  },
  angular: {
    name: "Angular",
  },
  vue: {
    name: "Vue",
  },
  scrum: {
    name: "Scrum",
  },
  ios: {
    name: "iOS",
  },
  android: {
    name: "Android",
  },
  fp: {
    name: "Functional programming",
  },
  fsharp: {
    name: "F sharp",
  },
  fintech: {
    name: "Fintech",
  },
  rust: {
    name: "Rust",
  },
  k8s: {
    name: "Kubernetes",
  },
  ml: {
    name: "Machine learning & AI",
  },
};

module.exports.topicName = (topic) => topics[topic].name;
module.exports.topics = topics;
module.exports.topicsOrdered = Object.keys(topics)
  .map((code) => ({ code: code, name: topics[code].name }))
  .ordered((it, that) => it.name.localeCompare(that.name));

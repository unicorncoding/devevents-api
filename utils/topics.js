const topics = {
  softskills: {
    name: "Soft Skills"
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
    name: "Web",
  },
  data: {
    name: "Data science",
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
    name: "Software Architecture",
  },
  agile: {
    name: "Agile",
  },
  php: {
    name: "PHP",
  },
  product: {
    name: "Product",
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
};

module.exports.topicName = (topic) => topics[topic].name;
module.exports.topics = topics;
module.exports.topicsOrdered = Object.keys(topics)
  .map((code) => ({ code: code, name: topics[code].name }))
  .ordered((it, that) => it.name.localeCompare(that.name));

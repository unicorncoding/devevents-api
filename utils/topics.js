const topics = [
  {
    topic: "other",
    name: "Other"
  },  
  {
    topic: "ddd",
    name: "DDD"
  },
  {
    topic: "microsoft",
    name: "Microsoft"
  },
  {
    topic: "clojure",
    name: "Clojure"
  },
  {
    topic: "cpp",
    name: "C and C++"
  },
  {
    topic: "mobile",
    name: "Mobile",
    aliases: [ "ios", "android" ]
  },
  {
    topic: "iot",
    name: "IoT"
  },
  {
    topic: "web",
    name: "Web",
    aliases: [ "css", "elm" ]
  },
  {
    topic: "data",
    name: "Data science"
  },
  {
    topic: "devops",
    name: "DevOps"
  },
  {
    topic: "dotnet",
    name: ".NET"
  },
  {
    topic: "elixir",
    name: "Elixir"
  },
  {
    topic: "erlang",
    name: "Erlang"
  },
  {
    topic: "fullstack",
    name: "Full-stack",
    aliases: [ "general" ]
  },
  {
    topic: "golang",
    name: "Golang"
  },
  {
    topic: "java",
    name: "Java",
  },
  {
    topic: "kotlin",
    name: "Kotlin"
  },
  {
    topic: "scala",
    name: "Scala"
  },
  {
    topic: "javascript",
    name: "JavaScript",
    aliases: [ "graphql", "typescript" ]
  },
  {
    topic: "leadership",
    name: "Leadership",
  },
  {
    topic: "management",
    name: "Management"
  },
  {
    topic: "agile",
    name: "Agile"
  },
  {
    topic: "php",
    name: "PHP"
  },
  {
    topic: "product",
    name: "Product"
  },
  {
    topic: "python",
    name: "Python",
  },
  {
    topic: "ruby",
    name: "Ruby and Rails"
  },
  {
    topic: "security",
    name: "Security"
  },
  {
    topic: "ux",
    name: "UX"
  }
];

module.exports = topics;
module.exports.topicName = topic => topics.find(it => it.topic == topic).name;
module.exports.topics = topics;
const topics = {
  cpp: {
    name: "C/C++",
  },
  mobile: {
    name: "Mobile / Android / iOS",
  },
  iot: {
    name: "Hardware / IoT",
  },
  web: {
    name: "Frontend",
    aliases: ["javascript"],
  },
  data: {
    name: "Data science / ML",
  },
  devops: {
    name: "DevOps",
  },
  dotnet: {
    name: ".NET",
  },
  elixir: {
    name: "Elixir",
    aliases: ["fp"],
  },
  architecture: {
    name: "Software Architecture",
    aliases: ["fullstack"],
  },
  fullstack: {
    name: "Full-stack",
    aliases: ["architecture"],
  },
  golang: {
    name: "Golang",
  },
  java: {
    name: "Java",
  },
  javascript: {
    name: "JavaScript",
    aliases: ["web"],
  },
  leadership: {
    name: "Tech leadership",
  },
  game: {
    name: "Game dev",
  },
  agile: {
    name: "Agile",
  },
  php: {
    name: "PHP",
  },
  product: {
    name: "Product / UX",
  },
  python: {
    name: "Python",
  },
  ruby: {
    name: "Ruby",
  },
  security: {
    name: "Security",
  },
  qa: {
    name: "QA / Testing",
  },
  blockchain: {
    name: "Blockchain",
    aliases: ["fintech"],
  },
  recruit: {
    name: "Career / Hiring / HR",
  },
  vr: {
    name: "AR / VR / XR",
  },
  fp: {
    name: "Functional programming",
  },
  fintech: {
    name: "Fintech",
  },
  rust: {
    name: "Rust",
  },
};

module.exports.topics = topics;
module.exports.relevantTopics = (mainTopic) => {
  const aliases = topics[mainTopic].aliases || [];
  return [mainTopic, ...aliases];
};

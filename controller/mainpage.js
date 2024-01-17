exports.gethomePage = (request, response, next) => {
  response.sendFile("index.html", { root: "view" });
};

exports.geterrorPage = (request, response, next) => {
  response.sendFile("pagenotfound404.html", { root: "view" });
};

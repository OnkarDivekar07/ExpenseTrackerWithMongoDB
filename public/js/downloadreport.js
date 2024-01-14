document.getElementById("downloadexpense").onclick = function () {
  download();
};

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function download() {
  const token = localStorage.getItem("token");
  const decodedtoken = parseJwt(token);
  if (decodedtoken.ispremiumuser == null) {
    alert("please buy membership to download a report");
  } else {
    axios
      .get("/expense/download", { headers: { Authorization: token } })
      .then((response) => {
        if (response.status === 201) {
          var a = document.createElement("a");
          a.href = response.data.fileUrl;
          a.download = "myexpense.csv";
          a.click();
        } else {
          throw new Error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

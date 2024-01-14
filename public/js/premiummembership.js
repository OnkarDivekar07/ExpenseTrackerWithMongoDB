document.addEventListener("DOMContentLoaded", function () {
  showpremiumusermessage();
});

document.getElementById("paybutton").onclick = async function (e) {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get("/purchase/purchasepremium", {
      headers: {
        Authorization: token,
      },
    });

    const options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        await axios.post(
          "/purchase/updatetranctionstatus",
          {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const newTokenResponse = await axios.get("/user/get-new-token", {
          headers: {
            Authorization: token,
          },
        });

        const newToken = newTokenResponse.data.token;
        localStorage.setItem("token", newToken);

        alert("Congratulations! You are now a premium user.");
      },
    };

    const rzpl = new Razorpay(options);
    rzpl.open();
    e.preventDefault();

    rzpl.on("payment failed", function (response) {
      alert("Something went wrong");
    });
  } catch (error) {
    console.error(error);
    alert("An error occurred during the payment process");
  }
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

function showpremiumusermessage() {
  try {
    const newToken = localStorage.getItem("token");
    const decodedToken = parseJwt(newToken);
    if (decodedToken.ispremiumuser) {
      document.getElementById("paybutton").style.display = "none";
      document.getElementById("premiumusermsg").innerHTML =
        "<h1>You are a premium user</h1>";
    }
  } catch (error) {
    console.error(error);
    alert("Error decoding the token");
  }
}

module.exports = async function (context, req) {
  context.log('Config API called');
  
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      healthEndpoint: process.env.API_HEALTH_ENDPOINT || "",
      emailEndpoint: process.env.API_EMAIL_ENDPOINT || "",
    },
  };
};
